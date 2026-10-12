import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { Publico, UsuarioAtual, type UsuarioToken } from './auth.decorators';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registrar.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Publico()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Publico()
  @Post('registrar')
  registrar(@Body() dto: RegistrarDto) {
    return this.authService.registrar(dto);
  }

  @Get('me')
  me(@UsuarioAtual() usuario: UsuarioToken) {
    return this.authService.me(usuario.sub);
  }
}
