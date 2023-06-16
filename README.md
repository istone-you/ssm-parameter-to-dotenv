# SSM パラメータストアから.env ファイルを作成

## パラメータ

`.env`と`parameters.json`をルートディレクトリに作成し、<br>
`.env`には

- SNS_ARN
- INSTANCE_ID
- SSM_PARAMETER_PREFIX

`parameters.json`には SSM パラメータストアに格納するパラメータを記述します。
