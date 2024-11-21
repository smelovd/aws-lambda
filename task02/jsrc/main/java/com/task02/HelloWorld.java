package com.task02;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.syndicate.deployment.annotations.lambda.LambdaHandler;
import com.syndicate.deployment.annotations.lambda.LambdaUrlConfig;
import com.syndicate.deployment.model.lambda.url.AuthType;
import com.syndicate.deployment.model.lambda.url.InvokeMode;
import com.syndicate.deployment.model.RetentionSetting;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@LambdaHandler(
    lambdaName = "hello_world",
	roleName = "hello_world-role",
	isPublishVersion = false,
	aliasName = "${lambdas_alias_name}",
	logsExpiration = RetentionSetting.SYNDICATE_ALIASES_SPECIFIED
)
@LambdaUrlConfig(
    authType = AuthType.NONE
)
public class HelloWorld implements RequestHandler<Object, Map<String, Object>> {

	public Map<String, Object> handleRequest(Object request, Context context) {
	System.out.println(request);
        String path = (request instanceof Map) ? (String) ((Map) request).get("path") : "";
        String method = (request instanceof Map) ? (String) ((Map) request).get("httpMethod") : "";

        Map<String, Object> resultMap = new LinkedHashMap<>();
        
        if (request instanceof Map) {
            Map<String, Object> event = (Map<String, Object>) request;
            // Extract the path and method from the request
            String path = (String) ((Map) event.get("requestContext")).get("http").get("path");
            String method = (String) ((Map) event.get("requestContext")).get("http").get("method");

            // Check the path and method
            if ("/hello".equals(path) && "GET".equalsIgnoreCase(method)) {
                resultMap.put("statusCode", 200);
                resultMap.put("message", "Hello from Lambda");
		return resultMap;
            } else {
                resultMap.put("statusCode", 400);
                resultMap.put("message", String.format("Bad request syntax or unsupported method. Request path: %s. HTTP method: %s", path, method));
		return resultMap;
            }
        } else {
            // Return an error message if the request format is not expected
            resultMap.put("statusCode", 400);
            resultMap.put("message", "Invalid request format");
        }

        return resultMap;
    }
}
