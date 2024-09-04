import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';

@Injectable()
export class RolesService {
  constructor (private prismaService: PrismaService){}
  async create(createRoleDto: CreateRoleDto) {
    createRoleDto.name= capitalizeFirstLetterOfEachWordInAPhrase(createRoleDto.name)
    const role = await this.prismaService.role.findFirst({
      where:{
        name: createRoleDto.name,

      },
    });
    if (role){
      throw new BadRequestException(`Role ${createRoleDto.name} has already been taken`);
    }
    return this.prismaService.role.create({data: createRoleDto});
  }

  findAll() {
    return this.prismaService.role.findMany();
  }

  async findOne(id: number) {
    return this.getRoleByID(id)
    }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    updateRoleDto.name= capitalizeFirstLetterOfEachWordInAPhrase(updateRoleDto.name)
    const role = await this.prismaService.role.findFirst({
      where:{
        name: updateRoleDto.name,

      },
    });
    if (role && role.id !== id){
      throw new BadRequestException(`Role ${updateRoleDto.name} has already been taken`);
    }
    return this.prismaService.role.update({where: {id}, data: updateRoleDto,})
  }

  async remove(id: number) {
 await this.getRoleByID(id);
 return this.prismaService.role.delete({where: {id}});
  }
private async getRoleByID(id: number){
  const role = await this.prismaService.role.findFirst({where: {id}});
    if(!role){
      throw new NotFoundException(`Role with id ${id} does not exist`);
    }
    return role;
  }
}

