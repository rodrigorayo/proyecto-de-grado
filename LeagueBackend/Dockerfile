# Usa la imagen oficial del SDK de .NET 8 para compilar
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copia los archivos del proyecto y restaura dependencias
COPY *.slnx .
COPY League.Application/*.csproj ./League.Application/
COPY League.Infrastructure/*.csproj ./League.Infrastructure/
COPY League.Presentation/*.csproj ./League.Presentation/
COPY League.WebApi/*.csproj ./League.WebApi/
COPY League/*.csproj ./League/
RUN dotnet restore League.WebApi/League.WebApi.csproj

# Copia todo lo demás y compila
COPY . .
WORKDIR /app/League.WebApi
RUN dotnet publish -c Release -o out

# Construye la imagen de ejecución
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/League.WebApi/out ./

# Expone el puerto 8080 (el puerto por defecto en contenedores .NET 8 y en Render)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "League.WebApi.dll"]
