import { FC, useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { useTranslation, Trans } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Input, Password } from "@illa-design/input"
import { Checkbox } from "@illa-design/checkbox"
import { Button } from "@illa-design/button"
import { Link } from "@illa-design/link"
import { Message } from "@illa-design/message"
import { Countdown } from "@illa-design/statistic"
import { WarningCircleIcon } from "@illa-design/icon"
import { EMAIL_FORMAT } from "@/constants/regExp"
import { Api } from "@/api/base"
import {
  formLabelStyle,
  formTitleStyle,
  gridFormFieldStyle,
  gridFormStyle,
  gridItemStyle,
  gridValidStyle,
  errorMsgStyle,
  errorIconStyle,
  checkboxTextStyle,
} from "@/page/User/style"
import { TextLink } from "@/page/User/components/TextLink"
import { RegisterFields, RegisterResult } from "./interface"
import { useDispatch } from "react-redux"
import { currentUserActions } from "@/redux/currentUser/currentUserSlice"

export const Register: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [verificationToken, setVerificationToken] = useState("")
  const [showCountDown, setShowCountDown] = useState(false)
  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<RegisterFields>({
    mode: "onBlur",
    defaultValues: {
      isSubscribe: true,
    },
  })
  const onSubmit: SubmitHandler<RegisterFields> = (data) => {
    Api.request<RegisterResult>(
      {
        method: "POST",
        url: "/auth/signup",
        data: {
          verificationToken,
          ...data,
        },
      },
      (res) => {
        dispatch(
          currentUserActions.updateCurrentUserReducer({
            userId: res.data.userId,
            userName: res.data.userName,
            language: "English",
            userAvatar: "",
          }),
        )
        navigate(localStorage.getItem("stashPath") ?? "/")
        localStorage.removeItem("stashPath")
        Message.success(t("user.sign_up.tips.success"))
      },
      () => {
        Message.error(t("user.sign_up.tips.fail"))
      },
    )
  }
  return (
    <form css={gridFormStyle} onSubmit={handleSubmit(onSubmit)}>
      <header css={formTitleStyle}>{t("user.sign_up.title")}</header>
      <section css={gridFormFieldStyle}>
        <section css={gridItemStyle}>
          <label css={formLabelStyle}>
            {t("user.sign_up.fields.username")}
          </label>
          <div css={gridValidStyle}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  error={!!errors.username}
                  variant="fill"
                  placeholder={t("user.sign_up.placeholder.username")}
                />
              )}
              rules={{
                required: t("user.sign_up.error_message.username.require"),
                maxLength: {
                  value: 15,
                  message: t("user.sign_up.error_message.username.length"),
                },
                minLength: {
                  value: 3,
                  message: t("user.sign_up.error_message.username.length"),
                },
              }}
            />
            {errors.username && (
              <div css={errorMsgStyle}>
                <WarningCircleIcon css={errorIconStyle} />
                {errors.username.message}
              </div>
            )}
          </div>
        </section>
        <section css={gridItemStyle}>
          <label css={formLabelStyle}>{t("user.sign_up.fields.email")}</label>
          <div css={gridValidStyle}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  error={!!errors.email}
                  variant="fill"
                  placeholder={t("user.sign_up.placeholder.email")}
                />
              )}
              rules={{
                required: t("user.sign_up.error_message.email.require"),
                pattern: {
                  value: EMAIL_FORMAT,
                  message: t(
                    "user.sign_up.error_message.email.invalid_pattern",
                  ),
                },
              }}
            />
            {errors.email && (
              <div css={errorMsgStyle}>
                <WarningCircleIcon css={errorIconStyle} />
                {errors.email.message}
              </div>
            )}
          </div>
        </section>
        <section css={gridItemStyle}>
          <label css={formLabelStyle}>{t("user.sign_up.fields.verify")}</label>
          <div css={gridValidStyle}>
            <Controller
              name="verify"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  error={!!errors.verify}
                  variant="fill"
                  suffix={{
                    render: showCountDown ? (
                      <Countdown
                        value={Date.now() + 1000 * 60}
                        now={Date.now()}
                        format="ss"
                        onFinish={() => {
                          setShowCountDown(false)
                        }}
                      />
                    ) : (
                      <Link
                        colorScheme="techPurple"
                        hoverable={false}
                        onClick={async () => {
                          const res = await trigger("email")
                          if (res) {
                            Api.request<{ verificationToken: string }>(
                              {
                                method: "POST",
                                url: "/auth/verification",
                                data: { email: getValues("email") },
                              },
                              (res) => {
                                setVerificationToken(res.data.verificationToken)
                                Message.success(t("user.sign_up.tips.verify"))
                                setShowCountDown(true)
                              },
                              () => {},
                              () => {},
                              () => {},
                            )
                          }
                        }}
                      >
                        {t("user.sign_up.actions.send")}
                      </Link>
                    ),
                  }}
                  placeholder={t("user.sign_up.placeholder.verify")}
                />
              )}
              rules={{
                required: t("user.sign_up.error_message.verify.require"),
              }}
            />
            {errors.verify && (
              <div css={errorMsgStyle}>
                <WarningCircleIcon css={errorIconStyle} />
                {errors.verify.message}
              </div>
            )}
          </div>
        </section>
        <section css={gridItemStyle}>
          <label css={formLabelStyle}>
            {t("user.sign_up.fields.password")}
          </label>
          <div css={gridValidStyle}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Password
                  {...field}
                  size="large"
                  error={!!errors.password}
                  variant="fill"
                  placeholder={t("user.sign_up.placeholder.password")}
                />
              )}
              rules={{
                required: t("user.sign_up.error_message.password.require"),
                maxLength: {
                  value: 20,
                  message: t("user.sign_up.error_message.password.length"),
                },
                minLength: {
                  value: 6,
                  message: t("user.sign_up.error_message.password.length"),
                },
              }}
            />
            {errors.password && (
              <div css={errorMsgStyle}>
                <WarningCircleIcon css={errorIconStyle} />
                {errors.password.message}
              </div>
            )}
          </div>
        </section>
      </section>
      <section css={gridItemStyle}>
        <div>
          <Controller
            name="isSubscribe"
            control={control}
            render={({ field }) => (
              <Checkbox
                {...field}
                checked={field.value}
                colorScheme="techPurple"
              >
                <span css={checkboxTextStyle}>
                  {t("user.sign_up.description.subscribe")}
                </span>
              </Checkbox>
            )}
          />
        </div>
      </section>
      <section css={gridFormFieldStyle}>
        <Button
          colorScheme="techPurple"
          size="large"
          buttonRadius="8px"
          fullWidth
        >
          {t("user.sign_up.actions.create")}
        </Button>
        <span css={checkboxTextStyle}>
          <Trans
            i18nKey="user.sign_up.description.policy"
            t={t}
            components={[<TextLink />, <TextLink />]}
          />
        </span>
      </section>
    </form>
  )
}

Register.displayName = "Register"
