# Makefile for Synology DSM Package
include /env.mak

EXEC = demo
OBJS = demo.o

all: $(EXEC)

$(EXEC): $(OBJS)
	$(CC) $(CFLAGS) $^ -o $@ $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

install: $(EXEC)
	mkdir -p $(DESTDIR)/var/packages/$(PKG_NAME)/target/bin/
	install -m 755 $(EXEC) $(DESTDIR)/var/packages/$(PKG_NAME)/target/bin/

clean:
	rm -rf *.o $(EXEC)

.PHONY: all install clean