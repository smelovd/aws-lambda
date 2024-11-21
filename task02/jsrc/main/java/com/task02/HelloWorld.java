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
    isPublishVersion = true,
    aliasName = "${lambdas_alias_name}",
    logsExpiration = RetentionSetting.SYNDICATE_ALIASES_SPECIFIED
)
@LambdaUrlConfig(
    authType = AuthType.NONE
)
public class HelloWorld implements RequestHandler<Object, Map<String, Object>> {

    public Map<String, Object> handleRequest(Object request, Context context) {
Map<String, Object> event = (Map<String, Object>) request;
System.out.println(event);
Map<String, Object> requestContext = (Map<String, Object>) event.get("requestContext");
System.out.println(requestContext);
            Map<String, String> httpContext = (Map<String, String>) requestContext.get("http");
System.out.println(httpContext);
            String path = httpContext.get("path");
System.out.println(path);
            String method = httpContext.get("method");
System.out.println(method);
        Map<String, Object> resultMap = new HashMap<>();
	resultMap.put("123","321");


	if ("/hello".equals(path) && ) {
                resultMap.put("statusCode", 200);
               // resultMap.put("message", "Hello from Lambda");
resultMap.put("body", "{\"message\": \"Bad request syntax or unsupported method. Request path: " + path + ". HTTP method: " + method + "\"}");
                resultMap.put("headers", new HashMap<String, String>() {{
                    put("Content-Type", "application/json");
                    put("Access-Control-Allow-Origin", "*");
                }});
        }

        return resultMap;
    }
}
