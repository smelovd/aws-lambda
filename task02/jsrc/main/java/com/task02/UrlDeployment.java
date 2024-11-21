package com.task02;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.syndicate.deployment.annotations.lambda.LambdaHandler;
import com.syndicate.deployment.model.RetentionSetting;

import java.util.HashMap;
import java.util.Map;

@LambdaHandler(
    lambdaName = "url_deployment",
    roleName = "url_deployment-role",
    isPublishVersion = false,
    aliasName = "${lambdas_alias_name}",
    logsExpiration = RetentionSetting.SYNDICATE_ALIASES_SPECIFIED
)
public class UrlDeployment implements RequestHandler<Map<String, Object>, Map<String, Object>> {

    @Override
    public Map<String, Object> handleRequest(Map<String, Object> request, Context context) {
        System.out.println("Received request: " + request);
        Map<String, Object> resultMap = new HashMap<>();
        
        String path = (String) request.get("rawPath");
        String method = (String) request.get("requestContext.http.method");
        
        if ("/hello".equals(path) && "GET".equalsIgnoreCase(method)) {
            resultMap.put("statusCode", 200);
            resultMap.put("message", "Hello from Lambda");
        } else {
            resultMap.put("statusCode", 400);
            resultMap.put("message", String.format(
                "Bad request syntax or unsupported method. Request path: %s. HTTP method: %s",
                path, method
            ));
        }
        
        return resultMap;
    }
}
