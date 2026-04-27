from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    auth_service_url: str = "http://auth:3002"
    product_service_url: str = "http://product-service:3003"

    class Config:
        env_file = ".env"


settings = Settings()
