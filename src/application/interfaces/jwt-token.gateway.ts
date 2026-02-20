import { JwtPayload } from 'src/domain/value-objects/token-payload.value-object';

export interface ITokenGateway {
  verifyAccessToken(token: string): Promise<JwtPayload>;
}
