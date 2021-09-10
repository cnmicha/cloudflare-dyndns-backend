import { Injectable } from '@nestjs/common';
import { CloudflareDnsRecord } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';
import axios from 'axios';
import { CloudflareDnsRecordWithCloudflareDnsZone } from './prisma/additionalTypes';
import { CloudflareDnsRecordClientInfo } from './types';

const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async notifyRecordIpAddress(record: CloudflareDnsRecord, currentIpAddress: string) {
    await this.prisma.cloudflareDnsRecord.update({
      where: {
        id: record.id,
      },
      data: {
        lastIpAddress: currentIpAddress,
        lastIpAddressTimestamp: new Date(),
      },
    });
  }

  isRecordUpdateRequired(record: CloudflareDnsRecord, newIpAddress: string): boolean {
    return !record.lastUpdateWasSuccessful || record.lastIpAddress !== newIpAddress;
  }

  async updateRecordIpAddress(
    record: CloudflareDnsRecordWithCloudflareDnsZone,
    newIpAddress: string,
  ): Promise<CloudflareDnsRecordClientInfo> {
    try {
      // Get all zones from Cloudflare
      const cloudflareApiDnsZones = (
        await axios.get(CLOUDFLARE_API_URL + '/zones?per_page=200', {
          headers: {
            Authorization: 'Bearer ' + record.cloudflareDnsZone.authToken,
            'Content-Type': 'application/json',
          },
        })
      ).data.result;

      console.log('cloudflareApiDnsZones: ' + cloudflareApiDnsZones.length + ' items');

      // Get the Cloudflare zone id of the DNS record we want to update
      const cloudflareApiDnsZone = cloudflareApiDnsZones.find((zone) => zone.name === record.cloudflareDnsZone.name);

      if (!cloudflareApiDnsZone) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error('No matching Cloudflare API zone found');
      }

      console.log('API: Zone ' + cloudflareApiDnsZone.name + ' has id ' + cloudflareApiDnsZone.id);

      // Get the Cloudflare record id of the DNS record we want to update
      const cloudflareApiDnsRecords = (
        await axios.get(CLOUDFLARE_API_URL + '/zones/' + cloudflareApiDnsZone.id + '/dns_records?per_page=200', {
          headers: {
            Authorization: 'Bearer ' + record.cloudflareDnsZone.authToken,
            'Content-Type': 'application/json',
          },
        })
      ).data.result;

      console.log('cloudflareApiDnsRecords: ' + cloudflareApiDnsRecords.length + ' items');

      // Get the Cloudflare record id of the DNS record we want to update
      let cloudflareApiDnsRecord = cloudflareApiDnsRecords.find(
        (apiRecord) => apiRecord.name === record.name && apiRecord.type === record.type,
      );

      if (!cloudflareApiDnsRecord) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error('No matching Cloudflare API zone found');
      }

      console.log('API: Record ' + cloudflareApiDnsRecord.name + ' has id ' + cloudflareApiDnsRecord.id);

      // Update Cloudflare DNS record with new IP address
      cloudflareApiDnsRecord = (
        await axios.patch(
          CLOUDFLARE_API_URL + '/zones/' + cloudflareApiDnsZone.id + '/dns_records/' + cloudflareApiDnsRecord.id,
          {
            content: newIpAddress,
          },
          {
            headers: {
              Authorization: 'Bearer ' + record.cloudflareDnsZone.authToken,
              'Content-Type': 'application/json',
            },
          },
        )
      ).data.result;

      /*console.log(
      'Updated cloudflareApiDnsRecord: ' +
        JSON.stringify(cloudflareApiDnsRecord),
    );*/
      console.log('Cloudflare DNS record update successful');

      await this.prisma.cloudflareDnsRecord.update({
        where: {
          id: record.id,
        },
        data: {
          lastUpdateWasSuccessful: true,
        },
      });

      return {
        name: cloudflareApiDnsRecord.name,
        type: cloudflareApiDnsRecord.type,
        content: cloudflareApiDnsRecord.content,
        proxied: cloudflareApiDnsRecord.proxied,
        ttl: cloudflareApiDnsRecord.ttl,
      };
    } catch (err) {
      await this.prisma.cloudflareDnsRecord.update({
        where: {
          id: record.id,
        },
        data: {
          lastUpdateWasSuccessful: false,
        },
      });

      throw err;
    }
  }
}
