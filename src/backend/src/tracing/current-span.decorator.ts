import { createParamDecorator } from '@nestjs/common';
import { trace } from '@opentelemetry/api';

export const CurrentSpan = createParamDecorator(() => trace.getActiveSpan());
