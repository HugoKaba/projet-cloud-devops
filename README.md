# 🚀 Projet Cloud DevOps IIM - Guide Complet

Un projet de déploiement d'applications web containerisées sur AWS avec Terraform et GitHub Actions dans le cadre d'un projet d'etude.

![AWS](https://img.shields.io/badge/AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation et configuration](#-installation-et-configuration)
- [Déploiement local](#-déploiement-local)
- [Déploiement sur AWS](#-déploiement-sur-aws)
- [Commandes utiles](#-commandes-utiles)
- [Surveillance et monitoring](#-surveillance-et-monitoring)
- [Note sur l'utilisation de l'IA](#-note-sur-lutilisation-de-lia)
- [Architecture détaillée](#-architecture-détaillée)
- [Dépannage](#-dépannage)

## 🎯 Vue d'ensemble

Ce projet implémente une architecture Cloud DevOps complète avec :

- **Frontend React** : Interface utilisateur moderne avec gestion des tâches (Todo List)
- **Backend Node.js** : API REST avec connexion DynamoDB
- **Infrastructure as Code** : Terraform pour l'infrastructure AWS
- **Pipeline CI/CD** : GitHub Actions pour le déploiement automatisé
- **CDN Global** : CloudFront pour performance mondiale
- **Sécurité avancée** : AWS IAM Roles + Session Manager
- **Monitoring** : CloudWatch avec dashboard et alertes

### 🏆 Innovations techniques

- **Déploiement** : Utilisation d'AWS Systems Manager Session Manager
- **Architecture IAM avancée** : Rôles spécifiques pour chaque service
- **CDN CloudFront** : Distribution globale avec cache intelligent
- **Pipeline sécurisé** : Secrets management avec AWS Secrets Manager
- **Monitoring complet** : CloudWatch Logs + Dashboard + Métriques personnalisées

## 🏗️ Architecture

```
       ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
       │   GitHub Repo   │───▶│ GitHub Actions  │───▶│   AWS Cloud     │
       │                 │    │    (CI/CD)      │    │                 │
       └─────────────────┘    └─────────────────┘    └─────────────────┘
                                         │
       ┌─────────────────────────────────┼──────────────────────────┐
       │                                 │                          │
┌──────▼──────┐                   ┌──────▼──────┐            ┌──────▼──────┐
│ CloudFront  │                   │     EC2     │            │   DynamoDB  │
│    (CDN)    │◄──────────────────┤    (Apps)   │            │ (Database)  │
└─────────────┘                   └─────────────┘            └─────────────┘
       │                                 │
┌──────▼──────┐                   ┌──────▼──────┐
│      S3     │                   │ CloudWatch  │
│  (Logs CF)  │                   │(Monitoring) │
└─────────────┘                   └─────────────┘
```

## 📋 Prérequis

### Comptes et accès requis
- **Compte AWS** avec Free Tier activé
- **Compte GitHub** pour le repository et les Actions
- **AWS CLI** configuré avec vos identifiants
- **Terraform** installé (version >= 1.0)
- **Docker** installé et fonctionnel
- **Node.js** (version >= 18) pour le développement local

## 🛠️ Installation et configuration

### 1. Cloner le repository
```

git clone https://github.com/HugoKaba/projet-cloud-devops.git
cd projet-cloud-devops
```

### 2. Structure du projet
```

projet-cloud-devops/
├── .github/workflows/      \# Pipeline CI/CD
│   └── deploy.yml
├── backend/               \# API Node.js
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/              \# Application React
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   └── src/
├── terraform/             \# Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── iam.tf
│   ├── cloudwatch.tf
│   ├── secrets.tf
│   ├── dynamodb.tf
│   └── ecr.tf
├── docker-compose.yml     \# Développement local
├── .gitignore
└── README.md

```

### 3. Configuration AWS
```


# Configurer AWS CLI

aws configure

# AWS Access Key ID: VOTRE_ACCESS_KEY

# AWS Secret Access Key: VOTRE_SECRET_KEY

# Default region name: eu-west-1

# Default output format: json

```

## 🚀 Déploiement local

### 1. Test en local avec Docker Compose
```


# Construire et démarrer les services

docker-compose up --build

# En arrière-plan

docker-compose up --build -d

# Voir les logs

docker-compose logs -f

# Arrêter les services

docker-compose down

```

### 2. Accès local
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001/api/health

## ☁️ Déploiement sur AWS

### 1. Déploiement de l'infrastructure Terraform

```
# Aller dans le dossier terraform

cd terraform

# Initialiser Terraform

terraform init

# Vérifier le plan de déploiement

terraform plan

# Déployer l'infrastructure

terraform apply

# Tapez "yes" pour confirmer

# Voir les outputs (IP publique, instance ID, etc.)

terraform output

```

### 2. Configuration des secrets GitHub

Allez dans **Settings → Secrets and variables → Actions** de votre repository GitHub et ajoutez :

| Nom du secret | Valeur | Description |
|---------------|--------|-------------|
| `AWS_ACCESS_KEY_ID` | Votre clé d'accès AWS | Authentification AWS |
| `AWS_SECRET_ACCESS_KEY` | Votre clé secrète AWS | Authentification AWS |
| `AWS_ACCOUNT_ID` | ID de votre compte AWS | Accès ECR |
| `EC2_HOST` | IP publique de votre instance | Adresse de déploiement |
| `BACKEND_HOST` | IP publique de votre instance | Configuration frontend |
| `BACKEND_PORT` | `3001` | Port du backend |

### 3. Déploiement automatique

```
# Déclencher le déploiement

git add .
git commit -m "feat: deploy to AWS production"
git push origin main

```

Le pipeline GitHub Actions va automatiquement :
1. **Builder** les images Docker
2. **Les pousser** vers ECR
3. **Se connecter** à l'instance EC2 via Session Manager
4. **Déployer** les nouvelles versions
5. **Effectuer** des health checks

### 4. Vérification du déploiement

```
# Voir l'IP publique

cd terraform
terraform output instance_ip

# Accéder à l'application

# Frontend : http://VOTRE_IP_PUBLIQUE

# API : http://VOTRE_IP_PUBLIQUE/api/health

```

## 📊 Surveillance et monitoring

### 1. CloudWatch Dashboard
```


# URL du dashboard (remplacer ACCOUNT_ID et REGION)

https://console.aws.amazon.com/cloudwatch/home?region=eu-west-1\#dashboards:name=IIM-Project-Dashboard

```

### 2. Logs des applications
```


# Voir les logs via AWS CLI

aws logs describe-log-groups --region eu-west-1
aws logs tail /iim-project/application --follow --region eu-west-1

# Logs directement sur l'instance

aws ssm start-session --target INSTANCE_ID
docker logs frontend-app
docker logs backend-app

```

### 3. Métriques personnalisées
- **Backend metrics** : http://VOTRE_IP/api/metrics
- **CloudWatch metrics** : CPU, Network, Memory
- **Application metrics** : Uptime, Request count, Errors

## 🤖 Note sur l'utilisation de l'IA

Dans ce projet, j'ai utilisé l'intelligence artificielle de manière ciblée pour améliorer deux aspects spécifiques **après avoir terminé l'application fonctionnelle** :

### 🎨 Amélioration du style frontend
Une fois l'application React entièrement développée et fonctionnelle, j'ai utilisé l'IA pour :
- **Optimiser le CSS** : Amélioration de l'interface utilisateur avec des animations et transitions
- **Responsive design** : Adaptation mobile-first pour une meilleure expérience utilisateur
- **Couleurs et thèmes** : Harmonisation de la palette de couleurs et amélioration de l'accessibilité

### 📋 Amélioration des logs CI/CD
Pour rendre le pipeline plus professionnel et plus lisible, l'IA m'a aidé à :
- **Formater les logs** : Ajout d'emojis et de couleurs pour une meilleure lisibilité
- **Messages informatifs** : Amélioration des messages de status et de progression
- **Gestion d'erreurs** : Messages d'erreur plus explicites et solutions suggérées

### 💡 Approche méthodologique
Il est important de noter que :
- **L'architecture complète** a été conçue et développée manuellement
- **Toute la logique métier** (API, base de données, infrastructure) a été écrite sans assistance
- **L'IA n'a été utilisée qu'en finition** pour l'amélioration esthétique ,expérience utilisateur et optimiser le code, afin de rendre le projet public et bien structurer

## 🏗️ Architecture détaillée

### Composants AWS
- **EC2** : Instance t2.micro avec Amazon Linux 2
- **CloudFront** : CDN global avec 100+ edge locations
- **DynamoDB** : Base de données NoSQL pour les données d'application
- **ECR** : Registre Docker privé pour les images
- **IAM** : Rôles et politiques pour la sécurité
- **CloudWatch** : Monitoring et logs centralisés
- **S3** : Stockage des logs CloudFront
- **Secrets Manager** : Gestion sécurisée des secrets
- **Systems Manager** : Accès sécurisé aux instances sans SSH

### Sécurité
- **Aucune clé SSH** : Utilisation exclusive de Session Manager
- **IAM Roles** : Permissions granulaires par service
- **Secrets masqués** : Aucun secret visible dans les logs
- **HTTPS ready** : Architecture préparée pour SSL/TLS

### Pipeline CI/CD
1. **Trigger** : Push sur la branche main
2. **Build** : Construction des images Docker
3. **Push** : Envoi vers ECR
4. **Deploy** : Déploiement via SSM sur EC2
5. **Health check** : Validation automatique
6. **Notification** : Status dans GitHub Actions

## 🎓 Conclusion

Ce projet est une stack Cloud DevOps moderne avec :
- Infrastructure as Code avec Terraform
- Containerisation avec Docker
- Pipeline CI/CD automatisé avec GitHub Actions
- Architecture sécurisée sans SSH
- Monitoring et observabilité avec CloudWatch

**Auteur** : Hugo Kaba  
**Projet** : IIM A4 Cloud DevOps  
**Technologies** : AWS, Terraform, Docker, React, Node.js, GitHub Actions  
**Date** : Juillet 2025
