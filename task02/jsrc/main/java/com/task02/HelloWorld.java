package com.task02;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.syndicate.deployment.annotations.lambda.LambdaHandler;
import com.syndicate.deployment.model.RetentionSetting;

import java.util.HashMap;
import java.util.Map;

@LambdaHandler(
    lambdaName = "hello_world",
	roleName = "hello_world-role",
	isPublishVersion = true,
	aliasName = "${lambdas_alias_name}",
	logsExpiration = RetentionSetting.SYNDICATE_ALIASES_SPECIFIED
)
public class HelloWorld implements RequestHandler<Object, Map<String, Object>> {

	public Map<String, Object> handleRequest(Object request, Context context) {
        String path = (request instanceof Map) ? (String) ((Map) request).get("path") : "";
        String method = (request instanceof Map) ? (String) ((Map) request).get("httpMethod") : "";

        Map<String, Object> resultMap = new HashMap<>();
        
        // Check if the request path is '/hello' and the method is 'GET'
        if ("/hello".equals(path) && "GET".equalsIgnoreCase(method)) {
            resultMap.put("statusCode", 200);
            resultMap.put("body", "Hello from Lambda");
        } else {
            // For all other paths or methods, return a 400 Bad Request
            resultMap.put("statusCode", 400);
            resultMap.put("body", String.format("Bad request syntax or unsupported method. Request path: %s. HTTP method: %s", path, method));
        }

        return resultMap;
    }
}
