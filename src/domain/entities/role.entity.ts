import { Permission } from 'src/domain/value-objects/permission.enum';

export class Role {
  constructor(
    public id: string,
    public name: string,
    public permissions: Permission[],
  ) {}
}
