import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Clock,
  Target
} from "lucide-react";

const predictionData = [
  { time: "10:00", mq2: 280, mq135: 390 },
  { time: "10:05", mq2: 310, mq135: 405 },
  { time: "10:10", mq2: 325, mq135: 420 },
  { time: "10:15", mq2: 360, mq135: 435 },
  { time: "10:20", mq2: 385, mq135: 460 },
  { time: "10:25", mq2: 410, mq135: 485 },
];

function PredictionEngine() {
  return (
    <main className="dashboard pe-page">

      <div className="pe-banner">
        <div>
          <span className="section-eyebrow">
            AEROSENTINEL INTELLIGENCE
          </span>
          <h1>Prediction Engine</h1>
          <p>
            Sensor trend analysis and early threat assessment.
          </p>
        </div>

        <div className="pe-mode">
          <BrainCircuit size={20} />
          DEMONSTRATION MODE
        </div>
      </div>

      <div className="pe-grid">

        <div className="pe-card">
          <div className="pe-card-heading">
            <Activity size={19} />
            <span>Current Risk Level</span>
          </div>

          <h2 className="pe-risk">LOW</h2>
          <p>Based on demonstration sensor data</p>
          <div className="pe-status">System monitoring</div>
        </div>

        <div className="pe-card">
          <div className="pe-card-heading">
            <TrendingUp size={19} />
            <span>MQ2 Trend</span>
          </div>

          <h2>Rising</h2>
          <p>Demonstration trend over recent readings</p>
          <div className="pe-warning">Trend requires observation</div>
        </div>

        <div className="pe-card">
          <div className="pe-card-heading">
            <Target size={19} />
            <span>Prediction Confidence</span>
          </div>

          <h2>Not available</h2>
          <p>No validated prediction model is connected.</p>
          <div className="pe-status">Rule-based analysis pending</div>
        </div>

        <div className="pe-card">
          <div className="pe-card-heading">
            <Clock size={19} />
            <span>Last Analysis</span>
          </div>

          <h2>Demo data</h2>
          <p>Sample readings are used for this interface.</p>
          <div className="pe-status">Live connection pending</div>
        </div>

      </div>

      <div className="pe-analysis">

        <div className="pe-section-title">
          <div>
            <h2>Threat Assessment</h2>
            <p>Illustrative analysis of sensor behaviour</p>
          </div>
          <BrainCircuit size={23} />
        </div>

        <div className="pe-assessment">
          <ShieldCheck size={27} />

          <div>
            <h3>No critical condition indicated in demo data</h3>
            <p>
              The current demonstration readings are below the
              illustrative warning level. This is not a validated
              gas-safety assessment.
            </p>
          </div>
        </div>

      </div>

      <div className="pe-analysis">

        <div className="pe-section-title">
          <div>
            <h2>Trend Analysis</h2>
            <p>Sample MQ2 and MQ135 sensor response</p>
          </div>
          <TrendingUp size={23} />
        </div>

        <div className="pe-trend-list">
          {predictionData.map((item, index) => (
            <div className="pe-trend-row" key={item.time}>
              <span>{item.time}</span>

              <div className="pe-trend-values">
                <span>MQ2: {item.mq2}</span>
                <span>MQ135: {item.mq135}</span>
              </div>

              {index === 0 ? (
                <TrendingDown size={17} />
              ) : (
                <TrendingUp size={17} />
              )}
            </div>
          ))}
        </div>

      </div>

      <div className="pe-footer-note">
        <AlertTriangle size={17} />
        <span>
          Demonstration interface only. Predictions and risk labels
          are not calibrated or suitable for real-world safety decisions.
        </span>
      </div>

    </main>
  );
}

export default PredictionEngine;