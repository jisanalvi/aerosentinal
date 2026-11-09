import {
  Wind,
  Fan,
  ArrowDown,
  ArrowUp,
  Activity,
  Gauge,
  Radio,
  ShieldCheck,
  CircleCheck,
  Clock
} from "lucide-react";

function AirflowSystem() {
  return (
    <main className="dashboard af-page">

      {/* Header */}
      <div className="af-header">
        <div>
          <span className="section-eyebrow">
            AEROSENTINEL ENVIRONMENTAL CONTROL
          </span>

          <h1>Airflow System</h1>

          <p>
            Dual-intake air sampling and airflow monitoring overview.
          </p>
        </div>

        <div className="af-demo-badge">
          <Activity size={18} />
          DEMONSTRATION MODE
        </div>
      </div>

      {/* Status Cards */}
      <div className="af-grid">

        <div className="af-card">
          <div className="af-card-heading">
            <Wind size={20} />
            <span>Airflow Status</span>
          </div>

          <h2>Monitoring</h2>

          <p>Illustrative system status</p>

          <span className="af-status">Demo Active</span>
        </div>

        <div className="af-card">
          <div className="af-card-heading">
            <Fan size={20} />
            <span>Sampling Pump</span>
          </div>

          <h2>Standby</h2>

          <p>No physical pump connection</p>

          <span className="af-neutral">Hardware Pending</span>
        </div>

        <div className="af-card">
          <div className="af-card-heading">
            <Gauge size={20} />
            <span>Airflow Rate</span>
          </div>

          <h2>Not Available</h2>

          <p>No airflow sensor connected</p>

          <span className="af-neutral">Sensor Pending</span>
        </div>

        <div className="af-card">
          <div className="af-card-heading">
            <ShieldCheck size={20} />
            <span>System Health</span>
          </div>

          <h2>Unverified</h2>

          <p>Physical system testing pending</p>

          <span className="af-neutral">Prototype Stage</span>
        </div>

      </div>

      {/* Dual Intake Architecture */}
      <section className="af-panel">

        <div className="af-panel-heading">
          <div>
            <h2>Dual Intake Architecture</h2>

            <p>
              Two sampling locations for environmental monitoring.
            </p>
          </div>

          <Wind size={23} />
        </div>

        <div className="af-intake-grid">

          <div className="af-intake-card">
            <div className="af-intake-icon">
              <ArrowDown size={27} />
            </div>

            <h3>Ceiling-Level Intake</h3>

            <p>
              Upper-level air sampling point.
            </p>

            <span className="af-status">Configured in Design</span>
          </div>

          <div className="af-intake-center">
            <div className="af-center-icon">
              <Wind size={34} />
            </div>

            <h3>Sampling Chamber</h3>

            <p>Central monitoring section</p>

            <div className="af-connector">
              DUAL INTAKE
            </div>
          </div>

          <div className="af-intake-card">
            <div className="af-intake-icon">
              <ArrowUp size={27} />
            </div>

            <h3>Floor-Level Intake</h3>

            <p>
              Lower-level air sampling point.
            </p>

            <span className="af-status">Configured in Design</span>
          </div>

        </div>

      </section>

      {/* Component Status */}
      <section className="af-panel">

        <div className="af-panel-heading">
          <div>
            <h2>Component Status</h2>

            <p>
              Prototype hardware integration progress.
            </p>
          </div>

          <Radio size={22} />
        </div>

        <div className="af-component-list">

          <div className="af-component">
            <div className="af-component-info">
              <Wind size={19} />
              <div>
                <h3>Ceiling Intake</h3>
                <p>Air sampling point</p>
              </div>
            </div>

            <span>Design Stage</span>
          </div>

          <div className="af-component">
            <div className="af-component-info">
              <Wind size={19} />
              <div>
                <h3>Floor Intake</h3>
                <p>Air sampling point</p>
              </div>
            </div>

            <span>Design Stage</span>
          </div>

          <div className="af-component">
            <div className="af-component-info">
              <Fan size={19} />
              <div>
                <h3>Sampling Pump</h3>
                <p>Physical connection pending</p>
              </div>
            </div>

            <span>Pending</span>
          </div>

          <div className="af-component">
            <div className="af-component-info">
              <Gauge size={19} />
              <div>
                <h3>Airflow Sensor</h3>
                <p>Not currently installed</p>
              </div>
            </div>

            <span>Not Connected</span>
          </div>

        </div>

      </section>

      {/* Information */}
      <div className="af-note">
        <Clock size={18} />

        <p>
          This is a demonstration interface. Airflow measurements,
          pump operation and physical intake performance have not
          yet been verified.
        </p>
      </div>

    </main>
  );
}

export default AirflowSystem;