import * as changeCase from "change-case";

export function getDefaultEndpointTemplate(endpointName: string) {
  const snakeCaseEndpointName = changeCase.snakeCase(endpointName).toLowerCase();

  return `import 'dart:async';

import 'package:alfred/alfred.dart';
import 'package:backend/backend.dart';

part '${snakeCaseEndpointName}_controller.dart';
part '${snakeCaseEndpointName}_middleware.dart';
`;
}
