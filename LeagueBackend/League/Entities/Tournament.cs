using League.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace League.Domain.Entities
{
    public class Tournament : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; private set; }

        public DateTime StartDate { get; private set; }
        public DateTime? EndDate { get; private set; }

        // --- Soft Delete (Estado Activo/Inactivo) ---
        public bool IsActive { get; private set; } = true;

        public void ToggleStatus()
        {
            IsActive = !IsActive;
            Touch();
        }
        // ---------------------------------------------


        // --- RELACIÓN 1:N (Un torneo tiene MUCHOS equipos) ---
        // Usamos virtual ICollection para que EF maneje la relación
        private readonly List<Team> _teams = new();
        public virtual IReadOnlyCollection<Team> Teams => _teams.AsReadOnly();

        // Constructor vacío REQUERIDO por EF Core
        protected Tournament() { }

        public Tournament(string name, DateTime startDate)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Nombre de torneo requerido.");
            Name = name.Trim();
            StartDate = startDate;
        }

        // --- MÉTODOS DE NEGOCIO ---

        public void AddTeam(Team team)
        {
            if (team == null) throw new DomainException("Equipo inválido.");

            // Validar si ya está en la lista local (aunque la validación real la hace la BD)
            if (_teams.Any(t => t.Id == team.Id))
                throw new DomainException("El equipo ya está inscrito en este torneo.");

            // Asignar la relación inversa
            team.AssignToTournament(this.Id);
            _teams.Add(team);
            Touch();
        }

        public void RemoveTeam(Guid teamId)
        {
            var teamToRemove = _teams.SingleOrDefault(t => t.Id == teamId);
            if (teamToRemove == null) throw new DomainException("Equipo no inscrito en este torneo.");

            _teams.Remove(teamToRemove);
            Touch();
        }

        public void Close(DateTime endDate)
        {
            if (endDate < StartDate) throw new DomainException("La fecha fin no puede ser menor al inicio.");
            EndDate = endDate;
            Touch();
        }
        public void UpdateDetails(string name, DateTime startDate, DateTime? endDate)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Nombre requerido");
            Name = name;
            StartDate = startDate;
            EndDate = endDate;
            Touch();
        }
    }
}