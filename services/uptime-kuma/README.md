# Uptime Kuma

Uptime Kuma monitors the status and latency of the services hosted at JaySync-Lab.

## Custom Notification Logic

> [!NOTE]
> Tailscale DNS is deliberately bypassed for Uptime Kuma notifications. This ensures that even if Tailscale routing goes down, critical alerts will still successfully reach their destinations.

## Custom UI

We utilize custom UI styling to align Uptime Kuma's status page with the lab's brand.

### Example CSS (`templates/uptime-kuma.css`)

```css
/* Custom Uptime Kuma Status Page Styles */
body {
    background-color: #121212 !important;
    color: #e0e0e0;
}

.item-name {
    font-weight: bold;
}
```

### Example HTML Email Template (`templates/email-template.html`)

```html
<div class="custom-alert">
    <h2>JaySync-Lab Alert</h2>
    <p>A monitored service has experienced a state change.</p>
</div>
```
