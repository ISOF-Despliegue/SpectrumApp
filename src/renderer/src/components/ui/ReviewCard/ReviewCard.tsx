/*import React from 'react';
import './ReviewCard.component.css';

// Importamos los componentes que ya tienes
import { ProfileImageBig } from '../ProfileImageBig';
import { LikeCard } from '../LikeCard';
import { DislikeCard } from '../DislikeCard';
import { ImageContainer } from '../ImageContainer'; // El que acabamos de crear

interface ReviewCardProps {
  title: string;
  username: string;
  date: string;
  content: string;
  score: number;
  profileImageUrl?: string;
  gameImageUrl?: string; // Si viene vacío, el ImageContainer mostrará tu placeholder azul
  likes: number;
  dislikes: number;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  title,
  username,
  date,
  content,
  score,
  profileImageUrl,
  gameImageUrl,
  likes,
  dislikes
}) => {
  return (
    <div className="review-card">

      <div className="review-profile">
        <ProfileImageBig src={profileImageUrl} />
      </div>

      <div className="review-content">
        <div className="review-header">
          <h3 className="review-title">{title}</h3>
          <span className="review-date">{date}</span>
        </div>

        <h4 className="review-username">{username}</h4>
        <p className="review-text">{content}</p>

        <div className="review-actions">
          <LikeCard count={likes} />
          <DislikeCard count={dislikes} />
        </div>
      </div>

      <div className="review-score-section">
        <span className="review-score">{score}</span>
      </div>

      <div className="review-image-section">
        <ImageContainer
          src={gameImageUrl}
          width="200px" // Ajusta el ancho según el diseño final
          aspectRatio="16/9" // Formato horizontal de la imagen derecha
        />
      </div>

    </div>
  );
};*/
