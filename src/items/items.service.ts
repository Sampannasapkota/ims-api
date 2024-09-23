import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';

@Injectable()
export class ItemsService {
  //first step maa constructor banako
  constructor(private prismaService : PrismaService){}

  //create ko laagi

  async create(createItemDto: CreateItemDto) {
    createItemDto.name = capitalizeFirstLetterOfEachWordInAPhrase(createItemDto.name)

    if(await this.checkIfItemExist(createItemDto.name)){
      throw new BadRequestException(`Item ${createItemDto.name}has already been taken`);
    }
    return this.prismaService.item.create({data: createItemDto});
  }
// findall ko laagi
  findAll() {
    return this.prismaService.item.findMany();
  }
//findone ko laagi
  async findOne(id: number) {
    return this.getItemById(id)
  }
  //update ko laagi

  async update(id: number, updateItemDto: UpdateItemDto) {
    updateItemDto.name= capitalizeFirstLetterOfEachWordInAPhrase(updateItemDto.name)
    if(!await this.checkIfItemExist(updateItemDto.name,id)){
      throw new BadRequestException(`Item ${id} has already been taken`);
    }
    return this.prismaService.item.update({where: {id}, data:updateItemDto,})
  }
//for remove
  async remove(id: number) {
   await this.getItemById(id);
   return this.prismaService.item.delete({where: {id}});
  }

  //refactoring
  private async checkIfItemExist(name: string, id?:number): Promise<boolean>{
    const item= await this.prismaService.item.findUnique({
      where: {name,}
    });
    if(id){
      return item? item.id===id : true;    }

  return !!item;
}

// refactoring for private function
private async getItemById(id: number){
  const item= await this.prismaService.role.findFirst({where: {id}});
  if(!item){
    throw new NotFoundException(`Item with id ${id} does not exist`);
  }
  return item;
}
}