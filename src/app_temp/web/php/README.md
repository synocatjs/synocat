# php app

> a package for dsm

**Template**: Vue.js desktop application
**Min DSM**:  7.0-40000
**Maintainer**: dir

---

## Directory structure

```
sykit/
├── INFO                       # Package metadata (required)
├── PACKAGE_ICON.PNG           # 64×64 icon (required by DSM 7.0)
├── PACKAGE_ICON_256.PNG       # 256×256 hi-res icon
├── scripts/
│   ├── start-stop-status      # Lifecycle controller (required)
│   ├── preinst / postinst     # Pre/post install
│   ├── preuninst / postuninst # Pre/post uninstall
│   └── preupgrade / postupgrade
├── conf/
│   ├── privilege              # Permissions (mandatory in DSM 7.0)
│   └── resource               # System resources (optional)
├── .vscode/settings.json      # IDE JSON Schema hints
└── .synocat/schemas/          # JSON Schema files
```

## Development workflow

```bash
synocat validate .          # Validate configuration
synocat info <field>        # Field documentation
synocat add resource port   # Add system resource
synocat pack .              # Generate .spk directory structure
```

## References

- [DSM Developer Guide 7.2.2](https://help.synology.com/developer-guide/)
- [ExamplePackages](https://github.com/SynologyOpenSource/ExamplePackages)
- [pkgscripts-ng](https://github.com/SynologyOpenSource/pkgscripts-ng)
