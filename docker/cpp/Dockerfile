FROM gcc:12-bullseye

# Create unprivileged sandbox user
RUN useradd -u 10001 -m -s /bin/bash sandboxuser

WORKDIR /sandbox

# Copy runner script
COPY run.sh /sandbox/run.sh
RUN chmod +x /sandbox/run.sh && chown -R sandboxuser:sandboxuser /sandbox

USER sandboxuser

ENTRYPOINT ["/sandbox/run.sh"]
