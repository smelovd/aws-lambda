package com.task03;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.syndicate.deployment.annotations.lambda.LambdaHandler;
import com.syndicate.deployment.annotations.lambda.LambdaUrlConfig;
import com.syndicate.deployment.model.lambda.url.AuthType;
import com.syndicate.deployment.model.RetentionSetting;

import java.util.HashMap;
import java.util.Map;

@LambdaHandler(lambdaName = "hello_world", roleName = "hello_world-role", isPublishVersion = false, aliasName = "${lambdas_alias_name}", logsExpiration = RetentionSetting.SYNDICATE_ALIASES_SPECIFIED)
@LambdaUrlConfig(authType = AuthType.NONE)
public class HelloWorld implements RequestHandler<Object, Map<String, Object>> {

    @Override
    public Map<String, Object> handleRequest(Object request, Context context) {
        System.out.println("Received request: " + request);
        Map<String, Object> resultMap = new HashMap<>();
        
        String body = String.format("{\"message\": \"Hello from Lambda\", \"statusCode\": %d}", 200);
        resultMap.put("statusCode", 200);
        resultMap.put("body", body);
        resultMap.put("headers", new HashMap<String, String>() {
            {
                put("Content-Type", "application/json");
                put("Access-Control-Allow-Origin", "*");
            }
        });

        return resultMap;
    }
}
