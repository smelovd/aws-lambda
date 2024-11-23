package com.task03;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.syndicate.deployment.annotations.lambda.LambdaHandler;
import com.syndicate.deployment.annotations.lambda.LambdaUrlConfig;
import com.syndicate.deployment.model.lambda.url.AuthType;
import com.syndicate.deployment.model.RetentionSetting;

import java.util.HashMap;
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

    @Override
    public Map<String, Object> handleRequest(Object request, Context context) {
        System.out.println("Received request: " + request);

        // Initialize the response map
        Map<String, Object> resultMap = new HashMap<>();
        
        if (request instanceof Map) {
            // Extract the path and method from the request context
            Map<String, Object> event = (Map<String, Object>) request;
            String path = (String) event.get("path");
            String method = (String) event.get("httpMethod");

            // Log path and method for debugging
            System.out.println("Path: " + path);
            System.out.println("Method: " + method);

            // Handling /hello path
            if ("/hello".equals(path) && "GET".equalsIgnoreCase(method)) {
                resultMap.put("statusCode", 200);
                String body = String.format("{\"message\": \"Hello from Lambda\", \"statusCode\": %d}", 200);
                resultMap.put("body", "{\"1234532523\" : 213123}");
                resultMap.put("headers", new HashMap<String, String>() {{
                    put("Content-Type", "application/json");
                    put("Access-Control-Allow-Origin", "*");
                }});
            } else {
                // Using String.format to format the error message
                String errorMessage = String.format("Bad request syntax or unsupported method. Request path: %s. HTTP method: %s", path, method);
                resultMap.put("statusCode", 400);
                String body = String.format("{\"message\": \"%s\", \"statusCode\": %d}", errorMessage, 400);
                resultMap.put("body", body);
                resultMap.put("headers", new HashMap<String, String>() {{
                    put("Content-Type", "application/json");
                    put("Access-Control-Allow-Origin", "*");
                }});
            }
        } else {
            // Return an error message for invalid request format
            resultMap.put("statusCode", 400);
            String body = "{\"message\": \"Invalid request format\", \"statusCode\": 400}";
            resultMap.put("body", body);
            resultMap.put("headers", new HashMap<String, String>() {{
                put("Content-Type", "application/json");
                put("Access-Control-Allow-Origin", "*");
            }});
        }

        // Return the response map
        return resultMap;
    }
}
