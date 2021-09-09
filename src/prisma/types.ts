import { CloudflareDnsRecord, CloudflareDnsZone } from '@prisma/client';

export interface CloudflareDnsRecordWithCloudflareDnsZone
  extends CloudflareDnsRecord {
  cloudflareDnsZone: CloudflareDnsZone;
}
