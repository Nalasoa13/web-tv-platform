# Documentation API - Web TV Platform

## Base URL

```
http://localhost:3000/api
```

## Authentification

Les endpoints admin nécessitent un token JWT dans l'en-tête `Authorization`:

```
Authorization: Bearer <token>
```

---

## Endpoints Publics

### Récupérer la Grille TV

**Endpoint:** `GET /schedule`

**Description:** Récupère tous les programmes de la grille TV

**Réponse:**
```json
[
  {
    "id": "uuid",
    "title": "Titre de l'émission",
    "description": "Description",
    "start_time": "2024-01-01T20:00:00Z",
    "end_time": "2024-01-01T21:00:00Z",
    "channel": "France 3",
    "video_url": "http://localhost:8080/hls/video.m3u8",
    "is_live": true
  }
]
```

---

### Récupérer les Vidéos VOD

**Endpoint:** `GET /vod`

**Paramètres Query:**
- `category` (optionnel): Filtrer par catégorie

**Réponse:**
```json
[
  {
    "id": "uuid",
    "title": "Titre de la vidéo",
    "description": "Description",
    "thumbnail": "http://exemple.com/thumb.jpg",
    "video_url": "http://localhost:8080/hls/video.m3u8",
    "duration": 3600,
    "category": "Film",
    "likes": 42,
    "views": 1250
  }
]
```

---

### Récupérer une Vidéo Spécifique

**Endpoint:** `GET /video/:id`

**Paramètres:**
- `id` (path): UUID de la vidéo

**Réponse:**
```json
{
  "id": "uuid",
  "title": "Titre de la vidéo",
  "description": "Description complète",
  "thumbnail": "http://exemple.com/thumb.jpg",
  "video_url": "http://localhost:8080/hls/video.m3u8",
  "duration": 3600,
  "category": "Film",
  "likes": 42,
  "views": 1251,
  "created_at": "2024-01-01T10:00:00Z"
}
```

**Note:** Les vues sont incrémentées à chaque appel

---

### Rechercher des Programmes

**Endpoint:** `GET /search`

**Paramètres Query:**
- `q` (requis): Terme de recherche (min 2 caractères)

**Réponse:**
```json
[
  {
    "id": "uuid",
    "title": "Titre",
    "description": "Description",
    "type": "vod" | "schedule",
    "thumbnail": "http://exemple.com/thumb.jpg",
    "video_url": "http://localhost:8080/hls/video.m3u8"
  }
]
```

---

### Récupérer les Commentaires

**Endpoint:** `GET /comments/:videoId`

**Paramètres:**
- `videoId` (path): UUID de la vidéo

**Réponse:**
```json
[
  {
    "id": "uuid",
    "username": "UtilisateurXYZ123",
    "content": "Excellent contenu!",
    "created_at": "2024-01-01T15:30:00Z",
    "likes": 5
  }
]
```

---

### Ajouter un Commentaire

**Endpoint:** `POST /comments/:videoId`

**Paramètres:**
- `videoId` (path): UUID de la vidéo

**Body:**
```json
{
  "username": "UtilisateurXYZ123",
  "content": "Mon commentaire ici"
}
```

**Réponse:**
```json
{
  "id": "uuid",
  "message": "Commentaire en attente de modération"
}
```

**Limites:**
- Max 5 commentaires par minute par IP
- Contenu limité à 500 caractères
- Pseudonyme entre 2 et 30 caractères

---

### Aimer une Vidéo

**Endpoint:** `POST /like/:videoId`

**Paramètres:**
- `videoId` (path): UUID de la vidéo

**Body:**
```json
{
  "clientId": "identifiant-client-unique"
}
```

**Réponse:**
```json
{
  "likes": 43,
  "clientId": "identifiant-client-unique"
}
```

**Note:** Un client ne peut aimer qu'une fois par vidéo

---

### Générer un Pseudonyme

**Endpoint:** `GET /generate-username`

**Réponse:**
```json
{
  "username": "BravePhénix456"
}
```

---

## Endpoints Admin

### Authentification Admin

**Endpoint:** `POST /admin/login`

**Body:**
```json
{
  "email": "admin@webtv.local",
  "password": "admin123"
}
```

**Réponse:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erreurs:**
- 401: Identifiants invalides

---

### Créer une Émission

**Endpoint:** `POST /admin/schedule`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Titre de l'émission",
  "description": "Description détaillée",
  "startTime": "2024-01-01T20:00:00Z",
  "endTime": "2024-01-01T21:00:00Z",
  "channel": "France 3",
  "videoUrl": "http://localhost:8080/hls/video.m3u8",
  "isLive": true
}
```

**Réponse:**
```json
{
  "id": "uuid",
  "message": "Émission créée"
}
```

---

### Créer une Vidéo VOD

**Endpoint:** `POST /admin/vod`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Titre de la vidéo",
  "description": "Description complète",
  "thumbnail": "http://exemple.com/thumb.jpg",
  "videoUrl": "http://localhost:8080/hls/video.m3u8",
  "duration": 3600,
  "category": "Film"
}
```

**Réponse:**
```json
{
  "id": "uuid",
  "message": "Vidéo créée (en attente de publication)"
}
```

---

### Publier une Vidéo

**Endpoint:** `PUT /admin/vod/:id/publish`

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "message": "Vidéo publiée"
}
```

---

### Récupérer les Commentaires en Attente

**Endpoint:** `GET /admin/comments/pending`

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
[
  {
    "id": "uuid",
    "video_id": "uuid",
    "username": "UtilisateurXYZ123",
    "content": "Commentaire à modérer",
    "created_at": "2024-01-01T15:30:00Z"
  }
]
```

---

### Approuver un Commentaire

**Endpoint:** `PUT /admin/comments/:id/approve`

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "message": "Commentaire approuvé"
}
```

---

### Rejeter un Commentaire

**Endpoint:** `DELETE /admin/comments/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "message": "Commentaire supprimé"
}
```

---

### Récupérer les Statistiques

**Endpoint:** `GET /admin/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "totalViews": 15420,
  "totalLikes": 1250,
  "totalComments": 342,
  "totalVideos": 45
}
```

---

## Codes de Statut HTTP

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Créé |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Non trouvé |
| 429 | Trop de requêtes |
| 500 | Erreur serveur |

---

## Rate Limiting

- **Endpoints publics**: 100 requêtes par 15 minutes
- **Commentaires**: 5 commentaires par minute
- **Autres endpoints admin**: Limités par JWT

---

## Exemples cURL

### Récupérer la grille TV

```bash
curl -X GET http://localhost:3000/api/schedule
```

### Récupérer les vidéos VOD

```bash
curl -X GET http://localhost:3000/api/vod
```

### Rechercher

```bash
curl -X GET "http://localhost:3000/api/search?q=film"
```

### Se connecter

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@webtv.local",
    "password": "admin123"
  }'
```

### Créer une vidéo VOD

```bash
curl -X POST http://localhost:3000/api/admin/vod \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Ma vidéo",
    "description": "Description",
    "videoUrl": "http://localhost:8080/hls/video.m3u8",
    "category": "Film"
  }'
```

### Ajouter un commentaire

```bash
curl -X POST http://localhost:3000/api/comments/video-id \
  -H "Content-Type: application/json" \
  -d '{
    "username": "MonPseudo",
    "content": "Excellent!"
  }'
```

---

## WebSocket (Socket.IO)

### Événements Disponibles

#### Client → Serveur

- `join-video`: Rejoindre une salle de vidéo
  ```javascript
  socket.emit('join-video', videoId);
  ```

- `like`: Envoyer un like en temps réel
  ```javascript
  socket.emit('like', videoId);
  ```

- `new-comment`: Envoyer un nouveau commentaire
  ```javascript
  socket.emit('new-comment', { videoId, username, content });
  ```

#### Serveur → Client

- `connected`: Confirmation de connexion
- `like-update`: Mise à jour des likes
- `comment-update`: Nouveau commentaire

---

## Gestion des Erreurs

Les erreurs sont retournées au format JSON:

```json
{
  "error": "Message d'erreur descriptif"
}
```

Exemples:

```json
{
  "error": "Token manquant"
}
```

```json
{
  "error": "Identifiants invalides"
}
```

```json
{
  "error": "Vidéo non trouvée"
}
```

---

## Bonnes Pratiques

1. **Authentification**: Stockez le token JWT de manière sécurisée (localStorage ou sessionStorage)
2. **Gestion des erreurs**: Toujours vérifier le statut HTTP et afficher un message approprié
3. **Rate limiting**: Respectez les limites de requêtes pour éviter les blocages
4. **Validation**: Validez les données côté client avant d'envoyer
5. **Cache**: Utilisez le cache pour les données qui changent rarement

---

**Dernière mise à jour**: 2024  
**Version API**: 1.0.0
