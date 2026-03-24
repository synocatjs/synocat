.PHONY: build link unlink clean default

build:
	@echo "Building..."
	pnpm build

link: build unlink
	@echo "Linking..."
	pnpm link

clean:
	@echo "Cleaning..."
	pnpm run clean

unlink:
	@echo "Unlinking..."
	-pnpm uninstall -g synocat
	-pnpm uninstall -g snc
	-pnpm unlink
	@echo "Checking..."
	@which synocat || echo "synocat not found"
	@which snc || echo "snc not found"

reinstall: clean build link
	@echo "Reinstalled successfully!"

default: build