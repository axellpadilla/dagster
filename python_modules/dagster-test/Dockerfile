ARG BASE_IMAGE
ARG PYTHON_VERSION

FROM "${BASE_IMAGE}"

COPY . /

ENV GOOGLE_APPLICATION_CREDENTIALS="/modules/gac.json"

ENV DAGSTER_DISABLE_TELEMETRY=true

# This makes sure that logs show up immediately instead of being buffered
ENV PYTHONUNBUFFERED=1

RUN pip install -U uv

RUN python -m uv pip install \
    -e modules/dagster \
    -e modules/dagster-graphql \
    -e modules/dagster-celery[flower,redis,kubernetes] \
    -e modules/dagster-webserver \
    -e modules/dagster-postgres \
    -e modules/dagster-pandas \
    -e modules/dagster-aws \
    -e modules/dagster-gcp \
    -e modules/dagster-k8s \
    -e modules/dagster-celery-k8s \
    -e modules/dagster-celery-docker \
    -e modules/dagster-docker \
    -e modules/dagster-airflow \
    -e modules/dagstermill \
    -e modules/dagster-pipes \
    -e modules/dagster-shared \
    -e .


RUN ! (pip list --exclude-editable | grep -e dagster)

WORKDIR /dagster_test/test_project/

EXPOSE 80
