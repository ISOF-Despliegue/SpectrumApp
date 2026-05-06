import React from 'react'
import { useTranslation } from 'react-i18next'
import { NavAdminButton } from '../../components/ui/NavBars/NavAdminButton'
import { ProfileImage } from '@renderer/components/ui/ProfileImage'
import { ProfileImageBig } from '@renderer/components/ui/ProfileImageBig'
import { ProfileImageMedium } from '@renderer/components/ui/ProfileImageMedium'
import { GameCard } from '@renderer/components/ui/GameCard'
import { GameCardMedium } from '@renderer/components/ui/GameCardMedium'
import { GameCardBig } from '@renderer/components/ui/GameCardBig'
import { GlassContainer } from '@renderer/components/ui/GlassContainer'
import { LikeCard } from '@renderer/components/ui/LikeCard'
import { DislikeCard } from '@renderer/components/ui/DislikeCard'
import { ImageContainer } from '@renderer/components/ui/ImageContainer'
import { ReviewCardComplete } from '@renderer/components/ui/ReviewCards/ReviewCardComplete'
import { ReviewCardPre } from '@renderer/components/ui/ReviewCards/RevieCardPre'

interface HomeProps {
  onProfileClick?: () => void
}

export const Home = ({ onProfileClick }: HomeProps = {}): React.JSX.Element => {
  const { t } = useTranslation('navbar')
  const handleProfileClick = onProfileClick ?? (() => undefined)

  return (
    <div className="home-page">
      <div style={{ display: 'flex' }}>
        <main>
          <h1>Bienvenido a la Home</h1>
          <h2>Este es un ejemplo para ver mis subtítulos</h2>
          <p> Este es un ejemplo para ver mi texto</p>
          <p className="smallText"> Este es un ejemplo para ver mi texto</p>
          {/* Aquí irán los componentes de juegos más adelante */}
          <NavAdminButton label={t('navbar.adminsManagement')} />
          <ProfileImage imageUrl={undefined} onClick={handleProfileClick} />

          <ProfileImageMedium imageUrl={undefined} onClick={handleProfileClick} />
          <ProfileImageBig imageUrl={undefined} onClick={handleProfileClick} />
          <GameCard imageUrl={undefined} onClick={handleProfileClick} />
          <GameCardMedium imageUrl={undefined} onClick={handleProfileClick} />
          <GameCardBig imageUrl={undefined} onClick={handleProfileClick} />

          <GlassContainer>
            <p>Contenido dentro del contenedor de cristal</p>
            <LikeCard initialLikes={1289} size="medium" />
            <DislikeCard initialDislikes={120} size="medium" />
          </GlassContainer>

          <ImageContainer></ImageContainer>

          <ReviewCardComplete
            gameCover={undefined} // Columna 1: Placeholder automático si es undefined
            userImage={undefined} // Columna 2: Fila 1 (Izquierda)
            username="Juana 098" // Columna 2: Fila 1 (Junto a la foto)
            reviewDate="25/03/2026" // Columna 2: Fila 1 (Hasta la derecha)
            reviewTitle="El mejor juego de halo" // Columna 2: Fila 2
            reviewContent="El juego es bueno y aquí murió halo, aunque siento que con los años ya ha perdido calidad." // Columna 2: Fila 2
            likes={1289} // Columna 2: Fila 3 (Alineados a la derecha)
            dislikes={120} // Columna 2: Fila 3 (Alineados a la derecha)
            score={87} // Columna 3: Puntuación destacada
            reviewImage={undefined} // Columna 4: Si es undefined, la columna no se renderiza
            isOwnReview={false}
            onReport={() => undefined}
          />

          <ReviewCardPre
            gameCover={undefined}
            username="Jimena91"
            reviewTitle="Basura de juego"
            reviewContent="Es malo porque no tiene sentido..."
            reviewDate="25/03/2026"
            score={20} // <-- Se verá rojo y con "vibración" pero en pequeño
            likes={10872}
            dislikes={120}
            reviewImage={undefined}
            isOwnReview={false}
            onClick={() => undefined}
            onReport={() => undefined}
          />
        </main>
      </div>
    </div>
  )
}
