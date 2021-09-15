import { Controller, ForbiddenException, Get, NotFoundException, Param, Put, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly prisma: PrismaService) {}

  @Put('record/:id/updateIpAddress')
  async putRecordIpAddress(@Param('id') id: string, @Req() req) {
    return this.updateRecordIpAddress(id, req.headers['x-api-key'], this.getClientIpAddress(req));
  }

  @Get('record/:id/updateIpAddress')
  async getRecordIpAddress(@Param('id') id: string, @Query('apiKey') apiKey: string, @Req() req) {
    return this.updateRecordIpAddress(id, apiKey, this.getClientIpAddress(req));
  }

  getClientIpAddress(@Req() req): string {
    return req.headers['x-real-ip'] || req.socket.remoteAddress;
  }

  async updateRecordIpAddress(id: string, apiKey: string, clientIpAddress: string) {
    const record = await this.prisma.cloudflareDnsRecord.findUnique({
      where: { id: Number(id) },
      include: { cloudflareDnsZone: true },
    });
    console.log('Got record: ' + JSON.stringify(record));

    if (!record) {
      throw new NotFoundException();
    }

    // Check auth
    if (apiKey !== record.authKey) {
      throw new ForbiddenException();
    }

    console.log('Client IP address: ' + JSON.stringify(clientIpAddress));

    await this.appService.notifyRecordIpAddress(record, clientIpAddress);

    const isUpdateRequired = this.appService.isRecordUpdateRequired(record, clientIpAddress);
    console.log('Is DNS record update required? ' + JSON.stringify(isUpdateRequired));

    if (isUpdateRequired) {
      console.log('New client IP address: ' + clientIpAddress);
      const updatedRecord = await this.appService.updateRecordIpAddress(record, clientIpAddress);
      return { success: true, updateWasRequired: true, record: updatedRecord };
    }

    return { success: true, updateWasRequired: false };
  }
}
