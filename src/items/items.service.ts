import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';

@Injectable()
export class ItemsService {
  //first step maa constructor banako
  constructor(private prismaService: PrismaService) {}

  //create ko laagi

  async create(createItemDto: CreateItemDto) {
    createItemDto.name = capitalizeFirstLetterOfEachWordInAPhrase(
      createItemDto.name,
    );
    return this.prismaService.$transaction(async (tx) => {
      const item = await tx.item.upsert({
        where: {
          name: createItemDto.name,
        },
        update: {},
        create: {
          name: createItemDto.name,
          quantity: createItemDto.quantity,
          price: createItemDto.price,
          ...(createItemDto.description && {
            description: createItemDto.description,
          }),
          ...(createItemDto.discount && {
            discount: createItemDto.discount,
          }),
          ...(createItemDto.discount_type && {
            discount_type: createItemDto.discount_type,
          }),
          ...(createItemDto.tax && {
            tax: createItemDto.tax,
          }),
        },
      });
      const itemOrganization = await tx.itemOrganization.findFirst({
        where: {
          item_id: item.id,
          organization_id: createItemDto.organization_id,
        },
      });
      if (itemOrganization) {
        throw new ConflictException('This item has already been added');
      }
      await tx.itemOrganization.create({
        data: {
          item_id: item.id,
          organization_id: createItemDto.organization_id,
        },
      });

      return item;
    });
  }
  // findall ko laagi
  async findAll(organization_id: number) {
    return this.prismaService.itemOrganization.findMany({
      where: { organization_id },
      include: {
        item: true,
      },
    });
  }
  //findone ko laagi
  async findOne(id: number, organization_id: number) {
    return this.getItemById(id, organization_id);
  }
  //update ko laagi

  async update(
    id: number,
    organization_id: number,
    updateItemDto: UpdateItemDto,
  ) {
    updateItemDto.name = capitalizeFirstLetterOfEachWordInAPhrase(
      updateItemDto.name,
    );
    // if (!(await this.checkIfItemExist(updateItemDto.name, id))) {
    //   throw new BadRequestException(`Item ${id} has already been taken`);
    // }
    return this.prismaService.item.update({
      where: { id },
      data: updateItemDto,
    });
  }
  //for remove
  async remove(id: number) {
    return this.prismaService.item.delete({ where: { id } });
  }

  //refactoring
  // private async checkIfItemExist(name: string, id?: number): Promise<boolean> {
  //   const item = await this.prismaService.item.findUnique({
  //     where: { name },
  //   });
  //   if (id) {
  //     return item ? item.id === id : true;
  //   }

  //   return !!item;
  // }

  // refactoring for private function
  private async getItemById(id: number, organization_id: number) {
    const item = await this.prismaService.itemOrganization.findFirst({
      where: {
        item_id: id,
        organization_id: organization_id,
      },
      include: {
        item: true,
      },
    });
    if (!item) {
      throw new NotFoundException(`Item with id ${id} does not exist`);
    }
    return item;
  }
}
