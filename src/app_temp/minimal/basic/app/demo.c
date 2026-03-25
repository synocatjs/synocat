#include <sys/sysinfo.h>
#include <syslog.h>
#include <stdio.h>
#include <unistd.h>

int main(int argc, char** argv) {
    struct sysinfo info;
    
    // 获取系统信息
    if (sysinfo(&info) != 0) {
        syslog(LOG_ERR, "Failed to get system info");
        return 1;
    }
    
    // 记录日志
    syslog(LOG_INFO, "[Demo] Package started");
    syslog(LOG_INFO, "[Demo] Total RAM: %lu MB", info.totalram / 1024 / 1024);
    syslog(LOG_INFO, "[Demo] Free RAM: %lu MB", info.freeram / 1024 / 1024);
    syslog(LOG_INFO, "[Demo] Uptime: %ld seconds", info.uptime);
    
    printf("Demo package running on Synology DSM\n");
    printf("Total RAM: %lu MB\n", info.totalram / 1024 / 1024);
    
    return 0;
}