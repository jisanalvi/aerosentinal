import {
  Zap,
  Fan,
  ShieldCheck,
  Power,
  Activity,
  Clock,
  AlertTriangle,
  Lock,
  Settings2
} from "lucide-react";

function Actuation() {
  const events = [
    {
      time: "10:35 AM",
      title: "System initialized",
      description: "Demonstration mode started",
      status: "INFO"
    },
    {
      time: "10:30 AM",
      title: "Exhaust fan status checked",
      description: "Simulation status: Standby",
      status: "INFO"
    },
    {
      time: "10:25 AM",
      title: "Isolation valve status checked",
      description: "Simulation status: Standby",
      status: "INFO"
    },
    {
      time: "10:20 AM",
      title: "Safety verification",
      description: "Physical hardware verification pending",
      status: "PENDING"
    }
  ];

  return (
    <main className="dashboard ac-page">

      {/* Header */}
      <div className="ac-header">
        <div>
          <span className="section-eyebrow">
            AEROSENTINEL RESPONSE SYSTEM
          </span>

          <h1>Actuation Control</h1>

          <p>
            Simulated response and isolation system overview.
          </p>
        </div>

        <div className="ac-demo-badge">
          <Zap size={18} />
          SIMULATION MODE
        </div>
      </div>

      {/* Status Cards */}
      <div className="ac-grid">

        <div className="ac-card">
          <div className="ac-card-heading">
            <Activity size={20} />
            <span>Actuation Status</span>
          </div>

          <h2>Standby</h2>

          <p>Simulation system ready</p>

          <span className="ac-status">Demo Active</span>
        </div>

        <div className="ac-card">
          <div className="ac-card-heading">
            <Fan size={20} />
            <span>Exhaust Fan</span>
          </div>

          <h2>Standby</h2>

          <p>No physical fan connected</p>

          <span className="ac-neutral">Hardware Pending</span>
        </div>

        <div className="ac-card">
          <div className="ac-card-heading">
            <Lock size={20} />
            <span>Isolation Valve</span>
          </div>

          <h2>Unverified</h2>

          <p>No physical valve connected</p>

          <span className="ac-neutral">Hardware Pending</span>
        </div>

        <div className="ac-card">
          <div className="ac-card-heading">
            <ShieldCheck size={20} />
            <span>Safety Verification</span>
          </div>

          <h2>Pending</h2>

          <p>Physical safety testing incomplete</p>

          <span className="ac-warning">Not Verified</span>
        </div>

      </div>

      {/* Control Panel */}
      <section className="ac-panel">

        <div className="ac-panel-heading">
          <div>
            <h2>Actuation Control Panel</h2>
            <p>Illustrative control interface</p>
          </div>

          <Settings2 size={22} />
        </div>

        <div className="ac-control-grid">

          <div className="ac-control-card">

            <div className="ac-control-icon">
              <Fan size={28} />
            </div>

            <h3>Exhaust Fan</h3>

            <p>Air extraction subsystem</p>

            <button disabled className="ac-disabled-button">
              <Power size={16} />
              Hardware Not Connected
            </button>

          </div>

          <div className="ac-control-card">

            <div className="ac-control-icon">
              <Lock size={28} />
            </div>

            <h3>Isolation Valve</h3>

            <p>Isolation subsystem</p>

            <button disabled className="ac-disabled-button">
              <Power size={16} />
              Hardware Not Connected
            </button>

          </div>

        </div>

        <div className="ac-manual-note">
          <AlertTriangle size={18} />

          <p>
            Manual controls are disabled in this demonstration.
            No real hardware commands are being sent.
          </p>
        </div>

      </section>

      {/* Event History */}
      <section className="ac-panel">

        <div className="ac-panel-heading">
          <div>
            <h2>Actuation Event History</h2>
            <p>Illustrative system activity records</p>
          </div>

          <Clock size={22} />
        </div>

        <div className="ac-event-list">

          {events.map((event, index) => (
            <div className="ac-event" key={index}>

              <div className="ac-event-icon">
                <Activity size={18} />
              </div>

              <div className="ac-event-info">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>

              <div className="ac-event-meta">
                <span>{event.time}</span>

                <small className={
                  event.status === "INFO"
                    ? "ac-event-info-status"
                    : "ac-event-pending"
                }>
                  {event.status}
                </small>
              </div>

            </div>
          ))}

        </div>

      </section>

      {/* Footer */}
      <div className="ac-footer-note">
        <ShieldCheck size={18} />

        <p>
          Prototype interface only. This dashboard is not a
          certified gas-safety or emergency-control system.
        </p>
      </div>

    </main>
  );
}

export default Actuation;