# Home Assistant

Central command for the smart home environment.

## Deployment Strategy

> [!IMPORTANT]
> **VM over Docker Decision:** We opted for a full Virtual Machine deployment (HAOS) rather than a Docker container. This allows us to leverage Supervisor for simple add-on management and robust snapshot-based backups without needing complex standalone container orchestration.

## EZVIZ RTSP Integration Logic

To securely integrate EZVIZ camera feeds directly into Home Assistant:

1. **Local Access:** Enabled the RTSP stream locally via the EZVIZ app.
2. **Integration:** Brought the feed into Home Assistant using internal LAN credentials.
3. **Local Polling Loop:** The network continuously polls the local stream directly, establishing a fully local loop that functions even if the external internet connection drops.
