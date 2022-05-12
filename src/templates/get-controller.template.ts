import * as changeCase from "change-case";

export function getDefaultControllerTemplate(endpointName: string) {
  const endpointController = `${endpointName}Controller`;
  const snakeCaseEndpointName = changeCase.snakeCase(endpointName).toLowerCase();

  return `part of '${snakeCaseEndpointName}.dart';

class ${endpointController} extends Controller<${endpointController}> {
  @override
  FutureOr<dynamic> run(HttpRequest req, HttpResponse res) {}

  @override
  ${endpointController} get newInstance => ${endpointController}();
}
`;
}
