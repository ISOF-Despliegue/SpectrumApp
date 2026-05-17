import React from 'react'
import styles from './ImageContainer.module.css'

interface ImageContainerProps {
  src?: string
  alt?: string
  width?: string | number
  height?: string | number
  aspectRatio?: string
  className?: string
}

export const ImageContainer: React.FC<ImageContainerProps> = ({
  src,
  alt = 'Imagen genérica',
  width = '100%',
  height = 'auto',
  aspectRatio = '16/9',
  className = ''
}) => {
  const containerStyle: React.CSSProperties = {
    width,
    height,
    aspectRatio
  }

  return (
    <div
      className={`${styles.container} ${!src ? styles.emptyPlaceholder : ''} ${className}`}
      style={containerStyle}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          className={styles.image}
        />
      )}
    </div>
  )
}
