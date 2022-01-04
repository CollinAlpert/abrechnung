from pathlib import Path

import yaml
from marshmallow import Schema, fields

CONFIG_SCHEMA = Schema.from_dict(
    name="ConfigSchema",
    fields={
        "service": fields.Nested(
            Schema.from_dict(
                {"url": fields.Str(), "name": fields.Str(), "api_url": fields.Str()}
            )
        ),
        "database": fields.Nested(
            Schema.from_dict(
                {
                    "host": fields.Str(),
                    "port": fields.Int(missing=5432, required=False),
                    "user": fields.Str(),
                    "dbname": fields.Str(),
                    "password": fields.Str(),
                }
            )
        ),
        "api": fields.Nested(
            Schema.from_dict(
                {
                    "secret_key": fields.Str(),
                    "host": fields.Str(),
                    "port": fields.Int(),
                    "id": fields.Str(),
                    "max_uploadable_file_size": fields.Int(
                        missing=1024, required=False
                    ),  # in KB
                    "enable_cors": fields.Bool(required=False, missing=True),
                    "enable_registration": fields.Bool(required=False, missing=False),
                    "valid_email_domains": fields.List(
                        fields.Str(), required=False, missing=[]
                    ),
                }
            )
        ),
        "email": fields.Nested(
            Schema.from_dict(
                {
                    "address": fields.Str(),
                    "host": fields.Str(),
                    "port": fields.Int(),
                    "mode": fields.Str(required=False),
                    "auth": fields.Nested(
                        Schema.from_dict(
                            {"username": fields.Str(), "password": fields.Str()},
                            name="MailAuthSchema",
                        ),
                        required=False,
                    ),
                }
            )
        ),
    },
)


class Config:
    def __init__(self, cfg: dict):
        self._cfg = cfg

    def get(self, key, default=None):
        return self._cfg.get(key, default)

    def __getitem__(self, key):
        return self._cfg.__getitem__(key)

    @classmethod
    def from_file(cls, file_path: Path):
        with file_path.open("r") as f:
            cfg = yaml.safe_load(f)
            cfg = CONFIG_SCHEMA().load(cfg)
            return cls(cfg)
