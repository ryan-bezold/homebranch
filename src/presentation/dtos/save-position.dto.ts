import { IsNotEmpty, IsString } from 'class-validator';

export class SavePositionDto {
  @IsNotEmpty({ message: 'Position is required' })
  @IsString({ message: 'Invalid position' })
  position: string;

  @IsNotEmpty({ message: 'Device name is required' })
  @IsString({ message: 'Invalid device name' })
  deviceName: string;
}
