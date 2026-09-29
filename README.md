# MEDIVITAL

Sitio web estático para presentar los sabores, la historia y el equipo de MEDIVITAL.

## Publicación

El sitio se despliega en GitHub Pages con la acción de `.github/workflows/pages.yml` al actualizar la rama `main`. En el repositorio, selecciona **Settings > Pages > Build and deployment > Source > GitHub Actions**.

Los archivos de las tarjetas originales del equipo se mantienen localmente y no se publican. La web utiliza retratos recortados en `assets/equipo/`.

## Encuesta compartida

La encuesta guarda respuestas cerradas anónimas en Supabase y consulta el gráfico mediante una función que solo devuelve conteos agregados. La página nunca recibe acceso de lectura a respuestas individuales.

Para activarla:

1. Crea un proyecto en Supabase.
2. En **SQL Editor**, ejecuta el contenido de `supabase/schema.sql`.
3. En **Project Settings > API**, copia la URL del proyecto y la clave `publishable` (o la clave heredada `anon`).
4. Coloca esos dos valores en `supabase-config.js`, reemplazando los textos `YOUR_PROJECT_REF` y `REPLACE_WITH_YOUR_PUBLIC_KEY`.
5. Publica los cambios en la rama `main` para volver a desplegar GitHub Pages.

La clave `publishable` es pública y está diseñada para usarse en el navegador; nunca pongas en `supabase-config.js` una clave `secret` o `service_role`. La tabla valida todas las opciones y no permite consultar filas desde la página.