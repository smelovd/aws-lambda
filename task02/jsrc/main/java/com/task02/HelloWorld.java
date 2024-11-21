package com.task02;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.syndicate.deployment.annotations.lambda.LambdaHandler;
import com.syndicate.deployment.annotations.lambda.LambdaUrlConfig;
import com.syndicate.deployment.model.lambda.url.AuthType;
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
        // Log the request for debugging
        System.out.println("Received event: " + request);

        // Initialize the response map
        Map<String, Object> resultMap = new LinkedHashMap<>();

        // Check if the request is a Map (expected structure)
        if (request instanceof Map) {
            Map<String, Object> event = (Map<String, Object>) request;

            // Extract the path and method from the requestContext
            Map<String, Object> requestContext = (Map<String, Object>) event.get("requestContext");
            Map<String, String> httpContext = (Map<String, String>) requestContext.get("http");
            String path = httpContext.get("path");
            String method = httpContext.get("method");

            // Check the path and method
            if ("/hello".equals(path) && "GET".equalsIgnoreCase(method)) {
                resultMap.put("statusCode", 200);
                resultMap.put("message", "Hello from Lambda");
            } else {
                resultMap.put("statusCode", 400);
                resultMap.put("message", String.format("Bad request syntax or unsupported method. Request path: %s. HTTP method: %s", path, method));
            }
        } else {
            // Return an error message if the request format is not expected
            resultMap.put("statusCode", 400);
            resultMap.put("message", "Invalid request format");
        }
	resultMap.put("headers", new HashMap<String, String>() {{
                    put("Content-Type", "application/json");
                }});

        System.out.println("Returning response: " + resultMap);

        return resultMap;
    }
}
