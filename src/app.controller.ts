import { Controller, ForbiddenException, NotFoundException, Param, Put, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly prisma: PrismaService) {}

  @Put('record/:id/updateIpAddress')
  async putRecordIpAddress(@Param('id') id: string, @Req() req) {
    console.log('Request headers: ' + JSON.stringify(req.headers));

    const record = await this.prisma.cloudflareDnsRecord.findUnique({
      where: { id: Number(id) },
      include: { cloudflareDnsZone: true },
    });
    console.log('Got record: ' + JSON.stringify(record));

    if (!record) {
      throw new NotFoundException();
    }

    // Check auth
    if (req.headers['x-api-key'] !== record.authKey) {
      throw new ForbiddenException();
    }

    const clientIpAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

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
