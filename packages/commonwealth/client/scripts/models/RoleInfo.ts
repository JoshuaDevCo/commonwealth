import type { AccessLevel } from '@hicommonwealth/core';
import type momentType from 'moment';
import moment from 'moment';
import type AddressInfo from './AddressInfo';

class RoleInfo {
  public readonly id: number;
  public readonly Address?: AddressInfo;
  public readonly address_id: number;
  public readonly address: string;
  public readonly address_chain: string;
  public readonly chain_id: string;
  public permission: AccessLevel;
  public allow: number;
  public deny: number;
  public is_user_default: boolean;
  public lastActive?: momentType.Moment;

  constructor(
    id: number,
    address_id: number,
    address: string,
    address_chain: string,
    chain_id: string,
    permission: AccessLevel,
    allow: number,
    deny: number,
    is_user_default: boolean,
    last_active?: string,
  ) {
    this.id = id;
    this.address_id = address_id;
    this.address = address;
    this.address_chain = address_chain;
    this.chain_id = chain_id;
    this.permission = permission;
    this.allow = allow;
    this.deny = deny;
    this.is_user_default = is_user_default;
    this.lastActive = last_active ? moment(last_active) : null;
  }
}

export default RoleInfo;
