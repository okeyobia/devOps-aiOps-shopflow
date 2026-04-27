from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    auth_service_url: str = "http://auth:3002"
    product_service_url: str = "http://product-service:3003"
    order_service_url: str = "http://order-service:3004"
    user_service_url: str = "http://user-service:3005"
    jwt_secret: str
    jwt_algorithm: str = "HS256"

    class Config:
        env_file = ".env"


settings = Settings()
