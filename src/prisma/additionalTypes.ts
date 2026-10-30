import { CloudflareDnsRecord, CloudflareDnsZone } from './generated/client';

export interface CloudflareDnsRecordWithCloudflareDnsZone extends CloudflareDnsRecord {
  cloudflareDnsZone: CloudflareDnsZone;
}
