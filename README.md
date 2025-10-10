# kikoperex.com - Mi Sitio Web Personal

Este repositorio contiene el código fuente y la documentación de infraestructura de mi sitio web 
personal, [kikoperex.com](https://kikoperex.com). Este proyecto sirve como mi laboratorio práctico para
tecnologías de nube, administración de sistemas y redes.

## Motivación y Objetivos

Este proyecto nació por mi motivación de aprender y conocer **nginx**. y sin querer, se convirtió en un despliegue completo de infraestructura desde cero, con las 
siguientes metas:

*   **Entender la Infraestructura Real:** Dejar la teoría y experimentar los desafíos de 
desplegar un servicio en un proveedor de nube real como AWS.
*   **Conocer el Stack de Servidor Linux:** Configurar un servidor Linux desde cero, instalar software,
gestionar servicios y asegurar el sistema.
*   **Crear un Portafolio "Vivo":** Tener un proyecto real y accesible en internet que demuestre mis 
habilidades prácticas.

## Arquitectura y Stack Tecnológico

La solución está desplegada sobre una base de tecnologías estándar en la industria:

*   **Hospedaje:** Instancia `t3.micro` en **Amazon Web Services (AWS EC2)**.
*   **Sistema Operativo:** **Debian 13** 
*   **Servidor Web:** **Nginx**, configurado como servidor de archivos estáticos y proxy inverso.
*   **Seguridad:**
    *   Certificado SSL/TLS gestionado por **Let's Encrypt / Certbot** para habilitar HTTPS.
    *   Reglas de firewall configuradas a través de **AWS Security Groups**.
*   **Redes:** Gestión de **DNS** para apuntar el dominio a la IP pública de la instancia.
*   **Control de Versiones:** **Git**
documentación.
*   **Automatización:** Scripts de **Bash** 

## Desafíos y Aprendizajes Clave

Durante la implementación, me enfrenté a varios desafíos que se convirtieron en lecciones prácticas muy
valiosas:

*   **Desafío 1: Conflicto de Puertos y Herramientas.**
    *   **Problema:** Mi plan inicial era correr Nginx dentro de un contenedor **Podman**, ya que es daemonless y eso me agradaba. Pero,
la herramienta de automatización de Certbot necesitaba acceso directo al puerto 80, lo que generó un 
conflicto.
    *   **Solución:** Tomé la decisión de cambiar la arquitectura. Migré de una solución en 
contenedores a una instalación nativa de Nginx gestionada por `systemd`, lo que simplificó la 
integración con Certbot y me enseñó a manejar servicios a nivel de sistema operativo.

*   **Desafío 2: Diagnóstico de Conectividad HTTPS.**
    *   **Problema:** Después de configurar SSL, el sitio era accesible por HTTP pero no por HTTPS. El 
navegador mostraba un error de tiempo de espera.
    *   **Solución:** Intenté varias cosas para llegar a un diagnóstico. Verifiqué la configuración de Nginx, 
el estado del servicio y los logs de Certbot. Al confirmar que la aplicación estaba bien, investigué la
siguiente capa: la red. Descubrí que había olvidado abrir el puerto `443` en el **firewall de AWS 
(Security Group)**.
    *   **Aprendizaje:** Esta experiencia fue crucial para entender que la infraestructura no es solo 
la aplicación, sino también las capas de red y seguridad que la rodean. Me enseñó la importancia de un 
troubleshooting metódico.

### Habilidades Adquiridas

Este proyecto me permitió pasar de la teoría a la práctica y conocer las bases en:
*   Administración de servidores Linux en un entorno de nube.
*   Configuración de servidores web y seguridad SSL/TLS.
*   Diagnóstico de problemas de red y firewalls.
*   Creación de flujos de trabajo de despliegue básicos con Bash y Git.
