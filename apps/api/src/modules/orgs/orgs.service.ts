import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@tm/data';
import { Organization } from '../../entities/organization.entity';

@Injectable()
export class OrgsService {
  constructor(@InjectRepository(Organization) private readonly orgs: Repository<Organization>) {}

  async isChildOrg(parentOrgId: string, maybeChildOrgId: string): Promise<boolean> {
    if (parentOrgId === maybeChildOrgId) return false;
    const child = await this.orgs.findOne({ where: { id: maybeChildOrgId } });
    if (!child) return false;
    return child.parentId === parentOrgId;
  }

  async accessibleOrgIds(userOrgId: string, role: Role): Promise<string[]> {
    if (role === Role.Viewer) return [userOrgId];
    const children = await this.orgs.find({ where: { parentId: userOrgId } });
    return [userOrgId, ...children.map((c) => c.id)];
  }

  async canAccessOrg(userOrgId: string, role: Role, targetOrgId: string): Promise<boolean> {
    if (targetOrgId === userOrgId) return true;
    if (role === Role.Viewer) return false;
    return this.isChildOrg(userOrgId, targetOrgId);
  }
}
