import { useEffect, useState } from "react";
console.log("API KEY:", process.env.REACT_APP_API_KEY);



export default function Content() {

  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {

    fetch("https://v3.football.api-sports.io/fixtures?team=645&league=203&season=2023", {
      headers: {
        "x-apisports-key": process.env.REACT_APP_API_KEY
        
      }
    })
      .then(res => res.json())
      .then(data => {
        setMatches(data.response);
        setLoading(false);
      })
      .catch(() => {
        setError("Maçlar yüklenirken hata oluştu");
        setLoading(false);
      });

    fetch("https://v3.football.api-sports.io/players?team=645&season=2023", {
      headers: {
        "x-apisports-key": process.env.REACT_APP_API_KEY
      }
    })
      .then(res => res.json())
      .then(data => {
        setPlayers(data.response.slice(0, 12));
      });

  }, []);

  const getResultClass = (match) => {

    const gsIsHome = match.teams.home.name === "Galatasaray";

    const gsGoals = gsIsHome
      ? match.goals.home
      : match.goals.away;

    const oppGoals = gsIsHome
      ? match.goals.away
      : match.goals.home;

    if (gsGoals > oppGoals) return "win";
    if (gsGoals < oppGoals) return "lose";
    return "draw";
  };

  const nextMatch = matches.find(
    m => m.fixture.status.short === "NS"
  );

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>

      <div className="filterBox">

        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          Tümü
        </button>

        <button
          className={filter === "win" ? "active" : ""}
          onClick={() => setFilter("win")}
        >
          Kazandık
        </button>

        <button
          className={filter === "lose" ? "active" : ""}
          onClick={() => setFilter("lose")}
        >
          Kaybettik
        </button>

      </div>

      {nextMatch && (
        <div className="nextMatch">
          <h2>⏭️ Sonraki Maç</h2>
          <p>
            {nextMatch.teams.home.name}
            <img src={nextMatch.teams.home.logo} alt="" className="teamLogo" />
            vs
            <img src={nextMatch.teams.away.logo} alt="" className="teamLogo" />
            {nextMatch.teams.away.name}
          </p>
          <p>
            Tarih: {nextMatch.fixture.date.slice(0, 10)}
          </p>
        </div>
      )}

      <div className="cards">
        {matches
          .filter(m => filter === "all" || getResultClass(m) === filter)
          .map(match => {

            const result = getResultClass(match);

            return (
              <div
                key={match.fixture.id}
                className={`card ${result}`}
              >

                <div className="teamRow">
                  <img src={match.teams.home.logo} alt="" />
                  <span>{match.teams.home.name}</span>
                </div>

                <h3>
                  {match.goals.home} - {match.goals.away}
                </h3>

                <div className="teamRow">
                  <img src={match.teams.away.logo} alt="" />
                  <span>{match.teams.away.name}</span>
                </div>

                <p>
                  {result === "win" && "🎉 Galatasaray Kazandı!"}
                  {result === "lose" && "😔 Galatasaray Kaybetti"}
                  {result === "draw" && "⚖️ Beraberlik"}
                </p>
              </div>
            );
          })}
      </div>

      <h2 style={{ textAlign: "center" }}>
        🌟 Galatasaray Oyuncuları
      </h2>

      <div className="playerGrid">
        {players.map(p => (
          <div
            className="playerCard"
            key={p.player.id}
            onClick={() => setSelectedPlayer(p)}
          >
            <img src={p.player.photo} alt="" />
            <h4>{p.player.name}</h4>
            <p>{p.statistics[0].games.position}</p>
          </div>
        ))}
      </div>

      {selectedPlayer && (
        <div className="popupBg" onClick={() => setSelectedPlayer(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>

            <img src={selectedPlayer.player.photo} alt="" />
            <h2>{selectedPlayer.player.name}</h2>

            <p>🎂 Yaş: {selectedPlayer.player.age}</p>
            <p>🌍 Ülke: {selectedPlayer.player.nationality}</p>
            <p>🎽 Forma No: {selectedPlayer.statistics[0].games.number}</p>
            <p>⚽ Gol: {selectedPlayer.statistics[0].goals.total || 0}</p>

            <button onClick={() => setSelectedPlayer(null)}>
              Kapat
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
