package com.task11;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.syndicate.deployment.annotations.lambda.LambdaHandler;
import com.syndicate.deployment.model.RetentionSetting;
import com.task11.services.ReservationService;
import com.task11.services.TableService;
import com.task11.services.UserService;

@LambdaHandler(lambdaName = "api_handler",
		roleName = "api_handler-role",
		isPublishVersion = true,
		aliasName = "${lambdas_alias_name}",
		logsExpiration = RetentionSetting.SYNDICATE_ALIASES_SPECIFIED
)
public class ApiHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

	public static volatile String FUNCTION_NAME = "";
	private final UserService userService = new UserService();
	private final TableService tableService = new TableService();
	private final ReservationService reservationService = new ReservationService();

	public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent gatewayEvent, Context context) {
		FUNCTION_NAME = context.getFunctionName();

		try {
			return route(gatewayEvent);
		} catch (Exception ex) {
			System.out.println("Handled exception during routing: ");
			ex.printStackTrace();
			return Utils.createUnsuccessfulResponseEvent();
		}
	}

	private APIGatewayProxyResponseEvent route(APIGatewayProxyRequestEvent gatewayEvent) {
		var path = gatewayEvent.getPath();
		var pathParameters = gatewayEvent.getPathParameters();
		var httpMethod = gatewayEvent.getHttpMethod();
		System.out.println("API gateway event = " + gatewayEvent);
		System.out.println("API gateway path = " + path);
		System.out.println("API gateway path parameters = " + pathParameters);

		APIGatewayProxyResponseEvent responseEvent = null;
		if (path.equals("/signup")) {
			responseEvent = userService.handleSignupRequest(gatewayEvent);
		}
		if (path.equals("/signin")) {
			responseEvent = userService.handleSigninRequest(gatewayEvent);
		}

		if (path.startsWith("/tables")) {
			if (gatewayEvent.getPath().equals("/tables")) {
				if (httpMethod.equals("GET")) {
					responseEvent = tableService.handleListTablesRequest();
				}
				if (httpMethod.equals("POST")) {
					responseEvent = tableService.handleCreateTableRequest(gatewayEvent);
				}
			}

			System.out.println("Path = " + path);
			if (pathParameters != null && pathParameters.get("tableId") != null) {
				System.out.println("TableId = " + pathParameters.get("tableId"));
				var tableId = Long.valueOf(gatewayEvent.getPathParameters().get("tableId"));
				System.out.println("TableId = " + tableId);
				responseEvent = tableService.handleGetTableRequest(tableId);
				System.out.println("ResponseEvent = " + responseEvent);
			}
		}

		if (path.equals("/reservations")) {
			if (httpMethod.equals("GET")) {
				responseEvent = reservationService.handleListReservationsRequest();
			}
			if (httpMethod.equals("POST")) {
				responseEvent = reservationService.handleCreateReservationRequest(gatewayEvent);
			}
		}

		return responseEvent;
	}
}