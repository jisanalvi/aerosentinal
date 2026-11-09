import {
  Cpu,
  Wifi,
  Radio,
  Activity,
  Wind,
  Thermometer,
  Droplets,
  Database,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Network,
} from "lucide-react";

function DeviceNetwork() {

  const devices = [
    {
      name: "ESP8266 NodeMCU",
      category: "Main IoT Controller",
      detail: "Primary wireless communication unit",
      icon: Cpu,
      status: "Connected",
      type: "online",
      protocol: "Wi-Fi",
    },
    {
      name: "MQ2 Sensor",
      category: "Combustible Gas Sensor",
      detail: "Gas and smoke detection",
      icon: Wind,
      status: "Awaiting Hardware",
      type: "pending",
      protocol: "Analog",
    },
    {
      name: "MQ135 Sensor",
      category: "Air Quality Sensor",
      detail: "Environmental air quality monitoring",
      icon: Activity,
      status: "Awaiting Hardware",
      type: "pending",
      protocol: "Analog",
    },
    {
      name: "BMP280 Sensor",
      category: "Pressure Sensor",
      detail: "Atmospheric pressure and temperature",
      icon: Thermometer,
      status: "Awaiting Hardware",
      type: "pending",
      protocol: "I2C",
    },
    {
      name: "DHT11 Sensor",
      category: "Humidity Sensor",
      detail: "Humidity and secondary temperature",
      icon: Droplets,
      status: "Awaiting Hardware",
      type: "pending",
      protocol: "Digital",
    },
  ];

  const services = [
    {
      name: "MQTT Broker",
      description: "Real-time device communication",
      icon: Radio,
      status: "Connected",
      type: "online",
    },
    {
      name: "MongoDB Atlas",
      description: "Cloud sensor data storage",
      icon: Database,
      status: "Connected",
      type: "online",
    },
    {
      name: "API Server",
      description: "Backend data communication",
      icon: Server,
      status: "Connected",
      type: "online",
    },
  ];

  const onlineCount = devices.filter(
    (device) => device.type === "online"
  ).length;

  return (
    <main className="dashboard device-network-page">

      <div className="welcome-section">
        <div>
          <span className="section-eyebrow">
            HARDWARE & CONNECTIVITY MANAGEMENT
          </span>

          <h1>Device Network</h1>

          <p>
            Monitor connected hardware, sensor modules and
            cloud communication services.
          </p>
        </div>

        <div className="overview-date">
          <Network size={17} />
          NETWORK OVERVIEW
        </div>
      </div>

      {/* Network Summary */}

      <div className="metrics-grid">

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon cyan">
              <Cpu size={21} />
            </div>
            <span className="metric-status">HARDWARE</span>
          </div>

          <p className="metric-title">Connected Devices</p>

          <div className="metric-value">
            {onlineCount}<span>/5</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon blue">
              <Server size={21} />
            </div>
            <span className="metric-status">SERVICES</span>
          </div>

          <p className="metric-title">Cloud Services</p>

          <div className="metric-value">
            3<span>/3</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon purple">
              <Wifi size={21} />
            </div>
            <span className="metric-status">NETWORK</span>
          </div>

          <p className="metric-title">Communication</p>

          <div className="metric-value">
            ACTIVE
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon orange">
              <AlertCircle size={21} />
            </div>
            <span className="metric-status">HARDWARE</span>
          </div>

          <p className="metric-title">Pending Devices</p>

          <div className="metric-value">
            {devices.length - onlineCount}
          </div>
        </div>

      </div>

      {/* Hardware Devices */}

      <div className="panel device-section">

        <div className="panel-header">
          <div>
            <h3>Hardware Devices</h3>
            <p>Registered sensors and controller modules</p>
          </div>

          <span className="active-tag">
            5 REGISTERED
          </span>
        </div>

        <div className="device-list">

          {devices.map((device, index) => {

            const Icon = device.icon;

            return (
              <div className="device-row" key={index}>

                <div className="device-icon">
                  <Icon size={23} />
                </div>

                <div className="device-info">
                  <strong>{device.name}</strong>
                  <small>{device.category}</small>
                  <p>{device.detail}</p>
                </div>

                <div className="device-protocol">
                  {device.protocol}
                </div>

                <div className={`device-status ${device.type}`}>
                  {device.type === "online" ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <AlertCircle size={15} />
                  )}

                  {device.status}
                </div>

              </div>
            );

          })}

        </div>

      </div>

      {/* Communication Services */}

      <div className="panel device-section">

        <div className="panel-header">
          <div>
            <h3>Communication Services</h3>
            <p>Backend and cloud infrastructure</p>
          </div>

          <span className="active-tag">
            SERVICE OVERVIEW
          </span>
        </div>

        <div className="service-grid">

          {services.map((service, index) => {

            const Icon = service.icon;

            return (
              <div className="service-card" key={index}>

                <div className="service-card-top">

                  <div className="device-icon">
                    <Icon size={23} />
                  </div>

                  <span className="service-online">
                    <span className="live-dot"></span>
                    {service.status}
                  </span>

                </div>

                <h3>{service.name}</h3>

                <p>{service.description}</p>

              </div>
            );

          })}

        </div>

      </div>

      {/* Network Information */}

      <div className="analytics-insight">

        <Network size={23} />

        <div>
          <h3>Network Information</h3>

          <p>
            AeroSentinel uses ESP8266 Wi-Fi connectivity,
            MQTT messaging and MongoDB Atlas for cloud-based
            sensor data management. Hardware statuses must
            be verified through actual device communication.
          </p>
        </div>

      </div>

    </main>
  );
}

export default DeviceNetwork;