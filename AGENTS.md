<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:deploy-workflow -->
# Flujo de trabajo y deploy

- Editar siempre primero en local.
- NO hacer commit ni push por iniciativa propia.
- Antes de subir, preguntar siempre: "¿commit y push?" y esperar la confirmación explícita del usuario.
- Al confirmar: hacer commit con mensaje claro y `git push` a `main`. Vercel deploya automáticamente al detectar el push.
<!-- END:deploy-workflow -->
