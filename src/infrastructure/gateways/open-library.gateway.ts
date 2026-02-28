import { Injectable, Logger } from '@nestjs/common';

interface BookSummarySearchDoc {
  key: string;
}

interface BookSummarySearchResponse {
  docs: BookSummarySearchDoc[];
}

interface OpenLibraryDescriptionObject {
  value: string;
}

interface OpenLibraryWorkResponse {
  description?: string | OpenLibraryDescriptionObject;
}

interface AuthorEnrichment {
  biography: string | null;
  photoUrl: string | null;
}

interface OpenLibraryAuthorSearchDoc {
  key: string;
  name: string;
}

interface OpenLibraryAuthorSearchResponse {
  docs: OpenLibraryAuthorSearchDoc[];
}

interface OpenLibraryAuthorBioObject {
  value: string;
}

interface OpenLibraryAuthorResponse {
  bio?: string | OpenLibraryAuthorBioObject;
}

interface AuthorSearchResult {
  key: string;
  hasBio: boolean;
}

@Injectable()
export class OpenLibraryGateway {
  private readonly logger = new Logger(OpenLibraryGateway.name);
  private readonly baseUrl = 'https://openlibrary.org';
  private readonly coversUrl = 'https://covers.openlibrary.org';
  private readonly userAgent = 'Homebranch (self-hosted e-book library; ryan.bezold@gmail.com)';
  private readonly timeoutMs = 8000;

  private createAbortSignal(): AbortSignal {
    return AbortSignal.timeout(this.timeoutMs);
  }

  async findBookSummary(
    title: string,
    author: string,
  ): Promise<string | null> {
    try {
      const searchUrl = `${this.baseUrl}/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1&fields=key`;
      const searchResponse = await fetch(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        signal: this.createAbortSignal(),
      });

      if (!searchResponse.ok) {
        return null;
      }

      const searchData =
        (await searchResponse.json()) as BookSummarySearchResponse;

      if (!searchData.docs || searchData.docs.length === 0) {
        return null;
      }

      const workKey = searchData.docs[0].key;
      const workUrl = `${this.baseUrl}${workKey}.json`;
      const workResponse = await fetch(workUrl, {
        headers: { 'User-Agent': this.userAgent },
        signal: this.createAbortSignal(),
      });

      if (!workResponse.ok) {
        return null;
      }

      const workData = (await workResponse.json()) as OpenLibraryWorkResponse;

      if (!workData.description) {
        return null;
      }

      if (typeof workData.description === 'string') {
        return workData.description;
      }

      return workData.description.value ?? null;
    } catch (error) {
      const cause =
        error instanceof TypeError && error.cause instanceof Error
          ? ` (${error.cause.message})`
          : '';
      this.logger.warn(
        `Failed to fetch book summary for "${title}" by "${author}" from Open Library: ${error instanceof Error ? error.message : String(error)}${cause}`,
      );
      return null;
    }
  }

  async findAuthorEnrichment(name: string): Promise<AuthorEnrichment> {
    try {
      const searchResult = await this.searchAuthorByName(name);
      if (!searchResult) {
        return { biography: null, photoUrl: null };
      }

      const olid = searchResult.key.replace('/authors/', '');
      const biography = searchResult.hasBio
        ? await this.fetchAuthorBiography(olid)
        : null;
      const photoUrl = await this.fetchAuthorPhotoUrl(olid);

      return { biography, photoUrl };
    } catch (error) {
      const cause =
        error instanceof TypeError && error.cause instanceof Error
          ? ` (${error.cause.message})`
          : '';
      this.logger.warn(
        `Failed to enrich author "${name}" from Open Library: ${error instanceof Error ? error.message : String(error)}${cause}`,
      );
      return { biography: null, photoUrl: null };
    }
  }

  private async searchAuthorByName(
    name: string,
  ): Promise<AuthorSearchResult | null> {
    const url = `${this.baseUrl}/search/authors.json?q=${encodeURIComponent(name)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': this.userAgent },
      signal: this.createAbortSignal(),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as OpenLibraryAuthorSearchResponse;

    if (!data.docs || data.docs.length === 0) {
      return null;
    }

    const exactMatch = data.docs.find(
      (doc) => doc.name.toLowerCase() === name.toLowerCase(),
    );
    const match = exactMatch ?? data.docs[0];

    const authorResponse = await fetch(
      `${this.baseUrl}/authors/${match.key}.json`,
      {
        headers: { 'User-Agent': this.userAgent },
        signal: this.createAbortSignal(),
      },
    );

    if (!authorResponse.ok) {
      return { key: match.key, hasBio: false };
    }

    const authorData = (await authorResponse.json()) as OpenLibraryAuthorResponse;
    return { key: match.key, hasBio: !!authorData.bio };
  }

  private async fetchAuthorBiography(olid: string): Promise<string | null> {
    const url = `${this.baseUrl}/authors/${olid}.json`;
    const response = await fetch(url, {
      headers: { 'User-Agent': this.userAgent },
      signal: this.createAbortSignal(),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as OpenLibraryAuthorResponse;

    if (!data.bio) {
      return null;
    }

    if (typeof data.bio === 'string') {
      return data.bio;
    }

    return data.bio.value ?? null;
  }

  private async fetchAuthorPhotoUrl(olid: string): Promise<string | null> {
    const url = `${this.coversUrl}/a/olid/${olid}-L.jpg?default=false`;
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': this.userAgent },
      signal: this.createAbortSignal(),
    });

    if (!response.ok) {
      return null;
    }

    return `${this.coversUrl}/a/olid/${olid}-L.jpg`;
  }
}
