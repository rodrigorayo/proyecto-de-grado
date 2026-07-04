using League.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace League.Domain.Entities
{
    public class Prediction : BaseEntity
    {
        [Required]
        public Guid MatchId { get; private set; }
        [ForeignKey("MatchId")]
        public virtual Match? Match { get; private set; }

        [Required]
        public Guid UserId { get; private set; } // 👈 Usamos Guid porque tu User.Id es Guid
        [ForeignKey("UserId")]
        public virtual User? User { get; private set; }

        public string UserName { get; private set; } // Para mostrar en el ranking rápido

        public int PredictedHomeScore { get; private set; }
        public int PredictedAwayScore { get; private set; }

        // Null = Partido no jugado aún. 0, 1 o 3 = Puntos ganados.
        public int? PointsEarned { get; private set; }

        protected Prediction() { }

        public Prediction(Guid matchId, Guid userId, string userName, int homeScore, int awayScore)
        {
            MatchId = matchId;
            UserId = userId;
            UserName = userName;
            PredictedHomeScore = homeScore;
            PredictedAwayScore = awayScore;
            PointsEarned = null;
        }

        public void UpdatePrediction(int homeScore, int awayScore)
        {
            if (PointsEarned.HasValue)
                throw new DomainException("No puedes modificar una predicción ya calificada.");

            PredictedHomeScore = homeScore;
            PredictedAwayScore = awayScore;
            Touch();
        }

        public void CalculatePoints(int realHomeScore, int realAwayScore)
        {
            // LÓGICA DE PUNTOS:
            // 3 Puntos: Marcador Exacto.
            // 1 Punto: Acertar Ganador (o Empate) pero no marcador.
            // 0 Puntos: Nada.

            if (PredictedHomeScore == realHomeScore && PredictedAwayScore == realAwayScore)
            {
                PointsEarned = 3; // ¡PLENO! 🎯
            }
            else
            {
                // Calcular ganadores (1=Local, 2=Visita, 0=Empate)
                int realWinner = realHomeScore > realAwayScore ? 1 : (realAwayScore > realHomeScore ? 2 : 0);
                int predWinner = PredictedHomeScore > PredictedAwayScore ? 1 : (PredictedAwayScore > PredictedHomeScore ? 2 : 0);

                if (realWinner == predWinner)
                    PointsEarned = 1; // ¡ACIERTAS QUIÉN GANA! ✅
                else
                    PointsEarned = 0; // FALLASTE ❌
            }
            Touch();
        }
    }
}