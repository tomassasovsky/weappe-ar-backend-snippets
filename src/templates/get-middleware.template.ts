import * as changeCase from "change-case";

export function getDefaultMiddlewareTemplate(endpointName: string) {
  const endpointMiddleware = `${endpointName}Middleware`;
  const snakeCaseEndpointName = changeCase.snakeCase(endpointName).toLowerCase();

  return `part of '${snakeCaseEndpointName}.dart';

class ${endpointMiddleware} extends Middleware<${endpointMiddleware}> {
  @override
  FutureOr<dynamic> run(HttpRequest req, HttpResponse res) {}

  @override
  ${endpointMiddleware} get newInstance => ${endpointMiddleware}();
}
`;
}
